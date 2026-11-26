"""가상 리뷰만 사용하는 1~3차시 검증. 실제 MOMO DB에 접근하지 않는다."""
import os
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from engine import StubEngine
from settings import Settings
from app import app

REVIEWS = [
    (910001, "20990001", "우주 영화 호평", "우주 탐험과 우주선 장면이 멋지고 음악이 좋다."),
    (910002, "20990001", "우주 영화 아쉬움", "우주 탐험은 좋지만 전개가 느리고 결말이 아쉽다."),
    (910003, "20990002", "바다 영화", "바다 잠수와 산호초 풍경이 아름답다."),
    (910004, "20990002", "관계없는 이야기", "요리 대회와 음식 준비가 흥미롭다."),
]

class EngineTest(unittest.TestCase):
    def setUp(self):
        self.engine = StubEngine(Settings(service_token="test-only", chunk_size=35, chunk_overlap=5))
        for review in REVIEWS:
            self.engine.index(*review)

    def test_chunking_and_search(self):
        self.assertGreater(self.engine.index(910005, "20990001", "긴 리뷰", "우주 탐험 " * 50), 1)
        hits = self.engine.search("우주 탐험", [910001, 910002, 910003, 910004], 4)
        self.assertEqual({c.review_id for c in hits}, {910001, 910002})
        self.assertGreater(hits[0].score, 0)

    def test_movie_allowed_ids_and_empty_filter(self):
        self.assertEqual(self.engine.search("바다 잠수", [910001, 910002], 5), [])
        self.assertEqual(self.engine.search("우주", [], 5), [])
        self.assertEqual(self.engine.search("우주", [910003], 5), [])

    def test_replace_and_delete(self):
        self.engine.index(910001, "20990001", "수정 리뷰", "기차 여행과 역 풍경")
        self.assertEqual(self.engine.search("우주", [910001], 5), [])
        self.assertTrue(self.engine.search("기차 여행", [910001], 5))
        self.assertGreater(self.engine.delete(910001), 0)
        self.assertEqual(self.engine.search("기차", [910001], 5), [])
        self.assertEqual(self.engine.delete(910001), 0)

class ApiTest(unittest.TestCase):
    def test_lifespan_auth_index_delete_and_query(self):
        with patch.dict(os.environ, {"SERVICE_TOKEN": "test-only"}):
            with TestClient(app) as client:
                self.assertEqual(client.get("/health").json(), {"status": "OK"})
                payload = dict(zip(("review_id", "movie_code", "title", "content"), REVIEWS[0]))
                self.assertEqual(client.post("/index", json=payload).status_code, 401)
                self.assertEqual(client.post("/index", json=payload, headers={"X-Service-Token": "wrong"}).status_code, 401)
                self.assertEqual(client.delete("/index/910001").status_code, 401)
                headers = {"X-Service-Token": "test-only"}
                response = client.post("/index", json=payload, headers=headers)
                self.assertGreater(response.json()["chunks"], 0)
                self.assertTrue(client.app.state.engine.search("우주", [910001], 3))
                self.assertEqual(client.post("/query", json={"question": "우주", "board_ids": [910001]}, headers=headers).json()["trace"],
                                 ["retrieve", "grade", "generate", "format"])
                self.assertEqual(client.post("/index", json={**payload, "review_id": -1}, headers=headers).status_code, 422)
                self.assertGreater(client.delete("/index/910001", headers=headers).json()["deleted"], 0)
                self.assertEqual(client.app.state.engine.search("우주", [910001], 3), [])

if __name__ == "__main__":
    unittest.main()
