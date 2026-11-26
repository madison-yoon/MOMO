"""External SDK boundaries are faked; no paid API or database is contacted."""
import copy
import hashlib
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from types import SimpleNamespace as NS
from unittest.mock import Mock, patch

import pytest

import engine
from graph import build_graph, run_graph
from settings import Settings


def matches(doc, query):
    for key, value in query.items():
        if isinstance(value, dict):
            if "$ne" in value and doc.get(key) == value["$ne"]:
                return False
            if "$in" in value and doc.get(key) not in value["$in"]:
                return False
        elif doc.get(key) != value:
            return False
    return True


class Collection:
    def __init__(self):
        self.docs = []
        self.partial = False
        self.hits = []
        self.pipeline = None

    def find(self, query):
        return copy.deepcopy([d for d in self.docs if matches(d, query)])

    def insert_many(self, docs, **kwargs):
        self.docs.extend(copy.deepcopy(docs[:1] if self.partial else docs))
        if self.partial:
            raise RuntimeError("partial insert")

    def delete_many(self, query):
        old = len(self.docs)
        self.docs = [d for d in self.docs if not matches(d, query)]
        return NS(deleted_count=old - len(self.docs))

    def update_many(self, query, update):
        for d in self.docs:
            if matches(d, query):
                d.update(update["$set"])

    def aggregate(self, pipeline, **kwargs):
        self.pipeline = pipeline
        return self.hits


@pytest.fixture
def setup():
    settings = Settings(service_token="test", _env_file=None, embedding_dimensions=3,
                        chunk_size=20, chunk_overlap=2)
    collection = Collection()
    api = Mock()
    api.embeddings.create.side_effect = lambda **kw: NS(data=[NS(index=i, embedding=[1., 0., 0.])
                                                              for i, _ in enumerate(kw["input"])])
    api.chat.completions.create.return_value = NS(choices=[NS(message=NS(content="좋다 [리뷰 #1]"))])
    assert hasattr(engine, "AtlasEngine"), "Atlas engine must be implemented"
    atlas = engine.AtlasEngine(settings, collection=collection, openai_client=api)
    return settings, collection, api, atlas


def indexed(atlas, content="우주 여행 장면이 아름답다. " * 8):
    fp = engine.review_fingerprint("제목", content, "movie")
    count = atlas.index(1, "movie", "제목", content, fp)
    return fp, count


def test_complete_generation_reuses_embeddings_and_detects_corruption(setup):
    _, coll, api, atlas = setup
    fp, count = indexed(atlas)
    assert count > 1
    assert len(coll.docs) == count
    assert all(d["fingerprint"] == fp and d["active"] for d in coll.docs)
    indexed(atlas)
    assert api.embeddings.create.call_count == 1
    coll.docs[0]["embedding"] = [0.]
    indexed(atlas)
    assert api.embeddings.create.call_count == 2
    assert len(coll.docs) == count


def test_embedding_and_partial_insert_failure_preserve_old_generation(setup):
    _, coll, api, atlas = setup
    indexed(atlas)
    old = copy.deepcopy(coll.docs)
    api.embeddings.create.side_effect = RuntimeError("offline")
    with pytest.raises(engine.ExternalServiceError):
        indexed(atlas, "새 본문 " * 20)
    assert coll.docs == old
    api.embeddings.create.side_effect = lambda **kw: NS(data=[NS(index=i, embedding=[1., 0., 0.])
                                                              for i, _ in enumerate(kw["input"])])
    coll.partial = True
    with pytest.raises(engine.ExternalServiceError):
        indexed(atlas, "새 본문 " * 20)
    assert coll.docs == old
    coll.partial = False
    fp, count = indexed(atlas, "새 본문 " * 20)
    assert len(coll.docs) == count
    assert {d["fingerprint"] for d in coll.docs} == {fp}
    assert atlas.delete(1) == count
    assert atlas.delete(1) == 0


def test_search_prefilters_and_removes_stale_disallowed_low_score_chunks(setup):
    _, coll, api, atlas = setup
    fp, _ = indexed(atlas)
    doc = coll.docs[0]
    coll.hits = [{**doc, "score": .9}, {**doc, "fingerprint": "old", "score": .99},
                 {**doc, "reviewId": 2, "score": .99}, {**doc, "score": .5}]
    hits = atlas.search("우주", [1], 5, {"1": fp})
    assert len(hits) == 1 and hits[0].fingerprint == fp
    stage = coll.pipeline[0]["$vectorSearch"]
    assert stage["filter"]["reviewId"] == {"$in": [1]}
    assert stage["filter"]["active"] is True
    assert stage["limit"] == 5
    before = api.embeddings.create.call_count
    assert atlas.search("우주", [], 5, {}) == []
    assert atlas.search("우주", [1], 5, {}) == []
    assert api.embeddings.create.call_count == before


@pytest.mark.parametrize("answer", ["근거 없음", "좋다 [리뷰 #999]", "좋다 [리뷰 #1] [리뷰 #2]",
                                    "좋다 [리뷰 #1] [리뷰 #x]", "좋다 [리뷰 #1] [리뷰 #999"])
def test_invalid_citations_abstain_and_drop_all_sources(setup, answer):
    settings, coll, api, atlas = setup
    fp, _ = indexed(atlas)
    coll.hits = [{**coll.docs[0], "score": .9}]
    api.chat.completions.create.return_value = NS(choices=[NS(message=NS(content=answer))])
    result = run_graph(build_graph(atlas, settings), "우주", [1], 5, {"1": fp})
    assert result["abstained"] and result["sources"] == []


def test_global_limits_atomic_and_reset_on_korean_date():
    assert hasattr(engine, "DailyBudget"), "global SDK-call budget must be implemented"
    budget = engine.DailyBudget(embedding_limit=5, llm_limit=2)
    def spend(_):
        try:
            budget.spend("embedding")
            return True
        except engine.BudgetExceeded:
            return False
    with ThreadPoolExecutor(max_workers=12) as pool:
        assert sum(pool.map(spend, range(30))) == 5
    budget.spend("llm")
    budget.spend("llm")
    with pytest.raises(engine.BudgetExceeded):
        budget.spend("llm")


def test_limit_stops_sdk_calls_including_search_and_rewrite(setup):
    _, coll, api, atlas = setup
    atlas.budget = engine.DailyBudget(embedding_limit=1, llm_limit=1)
    fp, _ = indexed(atlas)
    with pytest.raises(engine.BudgetExceeded):
        atlas.search("질문", [1], 5, {"1": fp})
    assert api.embeddings.create.call_count == 1
    atlas.rewrite("질문")
    with pytest.raises(engine.BudgetExceeded):
        atlas.rewrite("질문")
    assert api.chat.completions.create.call_count == 1


def test_unknown_engine_fails_explicitly():
    with pytest.raises(ValueError):
        Settings(service_token="test", rag_engine="typo", _env_file=None)


def test_fingerprint_uses_database_unicode_character_lengths():
    assert engine.review_fingerprint("😀한", "a:b", "m") == hashlib.sha256(
        "2:😀한3:a:b1:m".encode("utf-8")).hexdigest()
    assert engine.review_fingerprint("a", "bc", "m") != engine.review_fingerprint("ab", "c", "m")


def test_daily_reset_occurs_at_korean_midnight():
    budget = engine.DailyBudget(embedding_limit=1, llm_limit=1)
    with patch("engine.datetime") as clock:
        utc_now = datetime(2026, 11, 26, 14, 59, tzinfo=timezone.utc)
        clock.now.side_effect = lambda zone: utc_now.astimezone(zone)
        budget.spend("embedding")
        with pytest.raises(engine.BudgetExceeded):
            budget.spend("embedding")
        utc_now = datetime(2026, 11, 26, 15, 0, tzinfo=timezone.utc)
        budget.spend("embedding")
        assert clock.now.call_args.args[0].utcoffset(None).total_seconds() == 9 * 3600


@pytest.mark.parametrize("field,value", [("chunkNo", 99), ("chunkNo", None), ("embeddingModel", "other"),
                                        ("embeddingDimensions", 2), ("chunkSize", 40),
                                        ("chunkOverlap", 0), ("text", "corrupted")])
def test_reuse_rejects_inconsistent_chunk_metadata(setup, field, value):
    _, coll, api, atlas = setup
    indexed(atlas)
    coll.docs[0][field] = value
    indexed(atlas)
    assert api.embeddings.create.call_count == 2


def test_same_fingerprint_partial_failure_recovers_without_duplicates(setup):
    _, coll, api, atlas = setup
    fp, count = indexed(atlas)
    coll.docs.pop()  # force full regeneration of an incomplete old generation
    old = copy.deepcopy(coll.docs)
    coll.partial = True
    with pytest.raises(engine.ExternalServiceError):
        indexed(atlas)
    assert coll.docs == old
    coll.partial = False
    indexed(atlas)
    assert len(coll.docs) == count
    assert len({d["generation"] for d in coll.docs}) == 1
    assert {d["chunkNo"] for d in coll.docs} == set(range(count))


def test_old_cleanup_partial_failure_never_rolls_back_committed_new_chunks(setup):
    _, coll, api, atlas = setup
    indexed(atlas)
    original_delete = coll.delete_many
    def fail_old_cleanup(query):
        if isinstance(query.get("generation"), dict):
            # A network timeout may arrive after only some old documents were deleted.
            coll.docs = [d for i, d in enumerate(coll.docs)
                         if not (i == 0 and matches(d, query))]
            raise RuntimeError("old generation cleanup timeout")
        return original_delete(query)
    coll.delete_many = fail_old_cleanup
    with pytest.raises(engine.ExternalServiceError):
        indexed(atlas, "새 리뷰 본문 " * 12)
    new_fp = engine.review_fingerprint("제목", "새 리뷰 본문 " * 12, "movie")
    saved = [d for d in coll.docs if d["fingerprint"] == new_fp]
    assert saved and all(d["active"] for d in saved)
    requests = api.embeddings.create.call_count
    coll.delete_many = original_delete
    _, count = indexed(atlas, "새 리뷰 본문 " * 12)
    assert len(coll.docs) == count
    assert api.embeddings.create.call_count == requests


def test_no_evidence_rewrites_once_and_stale_chunks_never_reach_generation(setup):
    settings, coll, api, atlas = setup
    fp, _ = indexed(atlas)
    coll.hits = [{**coll.docs[0], "fingerprint": "f" * 64, "score": .99}]
    result = run_graph(build_graph(atlas, settings), "질문", [1], 5, {"1": fp})
    assert result["abstained"] and result["sources"] == []
    assert result["trace"] == ["retrieve", "grade", "rewrite", "retrieve", "grade", "abstain", "format"]
    assert api.chat.completions.create.call_count == 1
    assert api.chat.completions.create.call_args.kwargs["max_completion_tokens"] == 80


def test_valid_answer_sources_come_from_retrieved_chunks(setup):
    settings, coll, api, atlas = setup
    fp, _ = indexed(atlas)
    coll.hits = [{**coll.docs[0], "score": .9}]
    result = run_graph(build_graph(atlas, settings), "질문", [1], 5, {"1": fp})
    assert not result["abstained"]
    assert result["sources"][0]["fingerprint"] == fp
    assert api.chat.completions.create.call_args.kwargs["max_completion_tokens"] == 500


def test_deadline_stops_next_call_without_spending_budget(setup):
    _, coll, api, atlas = setup
    with engine.request_budget(0):
        with pytest.raises(engine.ExternalServiceError):
            indexed(atlas)
    assert api.embeddings.create.call_count == 0


def test_real_sdk_transport_has_no_hidden_retries(setup):
    import httpx
    from openai import OpenAI
    settings, coll, _, _ = setup
    settings.openai_api_key = "test-key-not-a-secret"
    attempts = []
    def transport(request):
        attempts.append(request.url.path)
        return httpx.Response(500, json={"error": {"message": "offline", "type": "test"}})
    with httpx.Client(transport=httpx.MockTransport(transport)) as http:
        def factory(**kwargs):
            assert kwargs["max_retries"] == 0
            return OpenAI(http_client=http, **kwargs)
        with patch("openai.OpenAI", side_effect=factory):
            atlas = engine.AtlasEngine(settings, collection=coll)
        with pytest.raises(engine.ExternalServiceError):
            indexed(atlas)
    assert attempts == ["/v1/embeddings"]


def test_cleanup_default_dry_run_preserves_existing_and_orphan_chunks():
    from cleanup_orphan_chunks import cleanup
    coll = Collection()
    coll.docs = [{"reviewId": 1}, {"reviewId": 2}, {"reviewId": 2}]
    coll.distinct = lambda key: [1, 2]
    result = cleanup(coll, [1])
    assert result == {"dry_run": True, "orphan_review_ids": [2], "deleted_chunks": 0}
    assert len(coll.docs) == 3
    assert cleanup(coll, [1], execute=True)["deleted_chunks"] == 2
    assert coll.docs == [{"reviewId": 1}]


def test_atlas_api_limits_health_auth_and_sanitized_outage(setup):
    from fastapi.testclient import TestClient
    from app import app
    _, coll, api, atlas = setup
    with patch.dict("os.environ", {"SERVICE_TOKEN": "test"}), patch("app.create_engine", return_value=atlas):
        with TestClient(app) as client:
            assert client.get("/health").json() == {"status": "OK", "engine": "atlas", "ready": True}
            assert api.embeddings.create.call_count == api.chat.completions.create.call_count == 0
            payload = {"review_id": 1, "movie_code": "movie", "title": "제목", "content": "본문"}
            assert client.post("/index", json=payload).status_code == 401
            headers = {"X-Service-Token": "test"}
            assert client.post("/index", json=payload, headers=headers).status_code == 422
            payload["fingerprint"] = engine.review_fingerprint("제목", "본문", "movie")
            atlas.budget = engine.DailyBudget(embedding_limit=0)
            assert client.post("/index", json=payload, headers=headers).status_code == 429
            assert api.embeddings.create.call_count == 0
            atlas.budget = engine.DailyBudget()
            api.embeddings.create.side_effect = RuntimeError("private connection details")
            response = client.post("/index", json=payload, headers=headers)
            assert response.status_code == 503 and "private" not in response.text
            for query in ({"question": "a" * 501}, {"question": "a", "top_k": 6}):
                assert client.post("/query", json=query, headers=headers).status_code == 422


def test_direct_query_cannot_bypass_embedding_or_llm_budget(setup):
    from fastapi.testclient import TestClient
    from app import app
    _, coll, api, atlas = setup
    fp, _ = indexed(atlas)
    coll.hits = [{**coll.docs[0], "score": .9}]
    with patch.dict("os.environ", {"SERVICE_TOKEN": "test"}), patch("app.create_engine", return_value=atlas):
        with TestClient(app) as client:
            query = {"question": "질문", "review_ids": [1], "fingerprints": {"1": fp}}
            headers = {"X-Service-Token": "test"}
            count = api.embeddings.create.call_count
            atlas.budget = engine.DailyBudget(embedding_limit=0)
            assert client.post("/query", json=query, headers=headers).status_code == 429
            assert api.embeddings.create.call_count == count
            atlas.budget = engine.DailyBudget(llm_limit=0)
            assert client.post("/query", json=query, headers=headers).status_code == 429
            assert api.chat.completions.create.call_count == 0
            atlas.budget = engine.DailyBudget()
            api.embeddings.create.side_effect = RuntimeError("private failure")
            response = client.post("/query", json=query, headers=headers)
            assert response.status_code == 503 and "private" not in response.text
            api.embeddings.create.reset_mock()
            query["fingerprints"] = {}
            result = client.post("/query", json=query, headers=headers)
            assert result.status_code == 200 and result.json()["abstained"]
            assert api.embeddings.create.call_count == 0


def test_same_review_indexes_serialize_and_reuse_single_embedding_request(setup):
    _, coll, api, atlas = setup
    started, release = Event(), Event()
    def embed(**kwargs):
        started.set()
        assert release.wait(3)
        return NS(data=[NS(index=i, embedding=[1., 0., 0.]) for i, _ in enumerate(kwargs["input"])])
    api.embeddings.create.side_effect = embed
    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(indexed, atlas)
        assert started.wait(3)
        second = pool.submit(indexed, atlas)
        release.set()
        fp, count = first.result(timeout=5)
        assert second.result(timeout=5) == (fp, count)
    assert api.embeddings.create.call_count == 1
    assert len(coll.docs) == count


def test_index_delete_share_striped_lock_and_leave_no_resurrected_chunks(setup):
    _, coll, api, atlas = setup
    started, release = Event(), Event()
    def embed(**kwargs):
        started.set()
        assert release.wait(3)
        return NS(data=[NS(index=i, embedding=[1., 0., 0.]) for i, _ in enumerate(kwargs["input"])])
    api.embeddings.create.side_effect = embed
    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(indexed, atlas)
        assert started.wait(3)
        deletion = pool.submit(atlas.delete, 1)
        release.set()
        _, count = first.result(timeout=5)
        assert deletion.result(timeout=5) == count
    assert coll.docs == []


def test_stub_lifespan_does_not_import_external_sdks():
    from fastapi.testclient import TestClient
    from app import app
    with patch.dict("os.environ", {"SERVICE_TOKEN": "test", "RAG_ENGINE": "stub"}), \
         patch.dict("sys.modules", {"openai": None, "pymongo": None}):
        with TestClient(app) as client:
            assert client.get("/health").json()["engine"] == "stub"


def test_atlas_initialization_error_hides_connection_details_without_fallback():
    settings = Settings(service_token="test", rag_engine="atlas", _env_file=None)
    with patch("engine.AtlasEngine", side_effect=ValueError("private-host-password")):
        with pytest.raises(RuntimeError) as failure:
            engine.create_engine(settings)
    assert "private-host-password" not in str(failure.value)
    assert failure.value.__suppress_context__
