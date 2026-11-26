"""가상 영화 리뷰로 그래프 분기와 API 계약을 검증하며 외부 서비스는 호출하지 않는다."""
import os
import sys
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from pydantic import ValidationError

from app import app
from engine import StubEngine
from graph import build_graph, run_graph
from settings import Settings


class GraphTest(unittest.TestCase):
    def setUp(self):
        self.settings = Settings(service_token="test-only", _env_file=None,
                                 chunk_size=35, chunk_overlap=5)
        self.engine = StubEngine(self.settings)
        self.engine.index(11, "20990001", "우주 영화", "우주 탐험과 우주선 장면이 좋다. " * 8)
        self.engine.index(12, "20990002", "바다 영화", "바다 잠수와 산호초 풍경이 아름답다.")
        self.graph = build_graph(self.engine, self.settings)

    def test_generate_uses_review_evidence_and_deduplicates_sources(self):
        hits = self.engine.search("우주 탐험", [11], 20)
        self.assertGreater(len(hits), 1)
        result = run_graph(self.graph, "우주 탐험", [11], 20)
        self.assertFalse(result["abstained"])
        self.assertEqual(result["trace"], ["retrieve", "grade", "generate", "format"])
        self.assertIn("우주 탐험", result["answer"])
        self.assertEqual(len(result["sources"]), 1)
        source = result["sources"][0]
        self.assertEqual(source["review_id"], 11)
        self.assertEqual(set(source), {"review_id", "title", "snippet", "score"})
        self.assertEqual(source["title"], "우주 영화")
        self.assertNotIn("제목:", source["snippet"])
        self.assertLessEqual(len(source["snippet"]), 120)
        self.assertEqual(source["score"], max(c.score for c in hits))

    def test_rewrite_can_find_review_on_second_search(self):
        question = "우주 탐험 알려주세요 궁금해요 어때요"
        self.assertEqual(self.engine.search(question, [11], 5), [])
        result = run_graph(self.graph, question, [11], 5)
        self.assertFalse(result["abstained"])
        self.assertEqual(result["trace"],
                         ["retrieve", "grade", "rewrite", "retrieve", "grade", "generate", "format"])
        self.assertEqual(result["sources"][0]["review_id"], 11)

    def test_no_evidence_abstains_after_exactly_two_searches(self):
        with patch.object(self.engine, "search", wraps=self.engine.search) as search:
            result = run_graph(self.graph, "요리 대회", [11, 12], 5)
        self.assertTrue(result["abstained"])
        self.assertIn("리뷰", result["answer"])
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["trace"],
                         ["retrieve", "grade", "rewrite", "retrieve", "grade", "abstain", "format"])
        self.assertEqual(search.call_count, 2)

    def test_empty_allowlist_never_searches_or_rewrites(self):
        with patch.object(self.engine, "search", wraps=self.engine.search) as search, \
                patch.object(self.engine, "rewrite", create=True) as rewrite:
            result = run_graph(self.graph, "우주 탐험", [], 5)
        self.assertTrue(result["abstained"])
        self.assertEqual(result["trace"], ["retrieve", "grade", "abstain", "format"])
        search.assert_not_called()
        rewrite.assert_not_called()

    def test_disallowed_review_never_enters_answer_or_sources(self):
        result = run_graph(self.graph, "바다 잠수", [11], 5)
        self.assertTrue(result["abstained"])
        self.assertEqual(result["sources"], [])
        self.assertNotIn("산호초", result["answer"])

    def test_zero_rewrites_searches_once_and_trace_does_not_leak_between_requests(self):
        settings = Settings(service_token="test-only", _env_file=None, max_rewrites=0)
        graph = build_graph(self.engine, settings)
        with patch.object(self.engine, "search", wraps=self.engine.search) as search:
            missing = run_graph(graph, "요리 대회", [11], 5)
        self.assertEqual(search.call_count, 1)
        self.assertEqual(missing["trace"], ["retrieve", "grade", "abstain", "format"])
        found = run_graph(graph, "우주 탐험", [11], 5)
        self.assertEqual(found["trace"], ["retrieve", "grade", "generate", "format"])

    def test_more_than_one_rewrite_is_rejected(self):
        with self.assertRaises(ValidationError):
            Settings(service_token="test-only", _env_file=None, max_rewrites=2)

    def test_grade_keeps_engine_accepted_score_after_rounding(self):
        # 실제 점수 1/3은 임계값 0.3333 이상이지만 응답 점수 0.333은 그보다 작다.
        settings = Settings(service_token="test-only", _env_file=None, stub_min_score=0.3333)
        engine = StubEngine(settings)
        engine.index(31, "20990001", "ab", "ef")
        result = run_graph(build_graph(engine, settings), "abcd", [31], 5)
        self.assertFalse(result["abstained"])
        self.assertEqual(result["sources"][0]["score"], 0.333)


class QueryApiTest(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(os.environ, {"SERVICE_TOKEN": "test-only"})
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.headers = {"X-Service-Token": "test-only"}
        self.payload = {"review_id": 21, "movie_code": "20990001", "title": "우주 영화",
                        "content": "우주 탐험과 우주선 장면이 멋지다."}

    def test_query_requires_service_token(self):
        with TestClient(app) as client:
            for headers in ({}, {"X-Service-Token": "wrong"}):
                self.assertEqual(client.post("/query", json={"question": "우주"},
                                             headers=headers).status_code, 401)

    def test_index_query_delete_contract_and_legacy_allowlist(self):
        with TestClient(app) as client:
            indexed = client.post("/index", json=self.payload, headers=self.headers)
            self.assertEqual(indexed.status_code, 200)
            self.assertEqual(set(indexed.json()), {"review_id", "chunks"})
            for key in ("review_ids", "board_ids"):
                response = client.post("/query", headers=self.headers,
                                       json={"question": "우주 탐험", key: [21], "top_k": 5})
                self.assertEqual(response.status_code, 200)
                body = response.json()
                self.assertEqual(set(body), {"answer", "abstained", "sources", "trace"})
                self.assertFalse(body["abstained"])
                self.assertEqual(body["sources"][0]["review_id"], 21)
            deleted = client.delete("/index/21", headers=self.headers)
            self.assertEqual(deleted.status_code, 200)
            self.assertEqual(set(deleted.json()), {"review_id", "deleted"})
            self.assertGreater(deleted.json()["deleted"], 0)
            result = client.post("/query", headers=self.headers,
                                 json={"question": "우주 탐험", "review_ids": [21]}).json()
            self.assertTrue(result["abstained"])
            self.assertEqual(result["sources"], [])

    def test_review_ids_controls_scope_even_when_legacy_key_is_present(self):
        with TestClient(app) as client:
            client.post("/index", json=self.payload, headers=self.headers)
            response = client.post("/query", headers=self.headers,
                                   json={"question": "우주 탐험", "review_ids": [], "board_ids": [21]})
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()["abstained"])

    def test_query_failure_returns_generic_error_and_keeps_index_available(self):
        with TestClient(app) as client:
            with patch.object(client.app.state.engine, "search", side_effect=RuntimeError("private-detail")):
                response = client.post("/query", headers=self.headers,
                                       json={"question": "우주", "review_ids": [21]})
            self.assertEqual(response.status_code, 500)
            self.assertNotIn("private-detail", response.text)
            self.assertEqual(client.post("/index", json=self.payload, headers=self.headers).status_code, 200)

    def test_graph_initialization_failure_isolated_from_index_and_delete(self):
        with patch("app.build_graph", side_effect=ImportError("langgraph unavailable")):
            with TestClient(app) as client:
                self.assertEqual(client.get("/health").status_code, 200)
                self.assertEqual(client.post("/index", json=self.payload, headers=self.headers).status_code, 200)
                self.assertEqual(client.post("/query", json={"question": "우주"},
                                             headers=self.headers).status_code, 503)
                self.assertEqual(client.delete("/index/21", headers=self.headers).status_code, 200)

    def test_missing_langgraph_import_does_not_stop_existing_apis(self):
        with patch.dict(sys.modules, {"langgraph.graph": None}):
            with TestClient(app) as client:
                self.assertEqual(client.post("/index", json=self.payload, headers=self.headers).status_code, 200)
                self.assertEqual(client.post("/query", json={"question": "우주"},
                                             headers=self.headers).status_code, 503)
                self.assertEqual(client.delete("/index/21", headers=self.headers).status_code, 200)


if __name__ == "__main__":
    unittest.main()
