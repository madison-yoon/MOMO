"""시드 스크립트는 표준 라이브러리와 가짜 API만으로 검증한다."""
import copy
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch
import urllib.error


SEED_PATH = Path(__file__).resolve().parents[1] / "scripts" / "seed.py"


class SeedTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not SEED_PATH.exists():
            return
        spec = importlib.util.spec_from_file_location("momo_seed", SEED_PATH)
        cls.seed = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.seed)

    def setUp(self):
        self.assertTrue(SEED_PATH.exists(), "Spring API 시드 스크립트가 필요합니다.")

    def test_seed_creates_two_members_ten_reviews_then_reruns_without_writes(self):
        api = FakeApi(self.seed)
        result = self.seed.seed(api, "fake-test-password")
        self.assertEqual(result, {"members_created": 2, "reviews_created": 10, "reviews_skipped": 0})
        self.assertEqual(len(api.users), 2)
        self.assertEqual([len(r) for r in api.reviews.values()], [5, 5])
        writes = api.writes
        self.assertEqual(self.seed.seed(api, "fake-test-password"),
                         {"members_created": 0, "reviews_created": 0, "reviews_skipped": 10})
        self.assertEqual(api.writes, writes)

    def test_existing_nonmatching_account_is_never_modified(self):
        api = FakeApi(self.seed)
        user = dict(self.seed.MEMBERS[0], userId=1, provider="LOCAL", password="different")
        api.users[user["loginId"]] = user
        with self.assertRaises(self.seed.SeedError):
            self.seed.seed(api, "fake-test-password")
        self.assertEqual(api.writes, 0)
        self.assertEqual(api.users[user["loginId"]]["password"], "different")

    def test_same_password_but_changed_profile_is_not_treated_as_seed_account(self):
        api = FakeApi(self.seed)
        user = dict(self.seed.MEMBERS[0], userId=1, provider="LOCAL", password="fake-test-password")
        user["email"] = "someone-else@example.invalid"
        api.users[user["loginId"]] = user
        with self.assertRaises(self.seed.SeedError):
            self.seed.seed(api, "fake-test-password")
        self.assertEqual(api.writes, 0)

    def test_changed_existing_review_blocks_all_new_review_writes(self):
        api = FakeApi(self.seed)
        self.seed.seed(api, "fake-test-password")
        api.reviews[1][0]["content"] = "사용자가 직접 수정한 원문"
        original = copy.deepcopy(api.reviews)
        with self.assertRaises(self.seed.SeedError):
            self.seed.seed(api, "fake-test-password")
        self.assertEqual(api.reviews, original)

    def test_film_title_mismatch_fails_before_creating_members(self):
        api = FakeApi(self.seed)
        api.bad_movie = True
        with self.assertRaises(self.seed.SeedError):
            self.seed.seed(api, "fake-test-password")
        self.assertEqual(api.writes, 0)

    def test_only_local_urls_allowed_and_redirects_rejected(self):
        for base in ["https://example.com", "http://localhost.evil", "http://user:pass@localhost",
                     "http://localhost/api", "http://127.0.0.1?remote=x"]:
            with self.assertRaises(self.seed.SeedError):
                self.seed.validate_base_url(base)
        self.assertEqual(self.seed.validate_base_url("http://127.0.0.1:8080/"), "http://127.0.0.1:8080")
        with self.assertRaises(self.seed.SeedError):
            self.seed.NoRedirect().redirect_request(None, None, 302, "", {}, "https://example.com")

    def test_dry_run_never_opens_network_or_asks_password(self):
        with patch.object(self.seed, "Api", side_effect=AssertionError("network prohibited")), \
             patch.object(self.seed.getpass, "getpass", side_effect=AssertionError("password prohibited")), \
             patch("sys.stdout", new_callable=io.StringIO):
            self.assertEqual(self.seed.main([]), 0)

    def test_execute_requires_explicit_database_confirmation(self):
        with patch.object(self.seed, "Api", side_effect=AssertionError("network prohibited")):
            with self.assertRaises(self.seed.SeedError):
                self.seed.main(["--execute"])

    def test_http_error_response_and_credentials_are_never_exposed(self):
        api = self.seed.Api("http://localhost:8080")
        failure = urllib.error.HTTPError("http://localhost:8080/api/auth/login", 401,
                                         "private-password", {}, io.BytesIO(b"private-token-body"))
        with patch.object(api.opener, "open", side_effect=failure):
            with self.assertRaises(self.seed.SeedError) as error:
                api.call("POST", "/api/auth/login", {"password": "private-password"})
        self.assertEqual(str(error.exception), "Spring API 요청 실패 (HTTP 401).")
        self.assertEqual(error.exception.status, 401)

    def test_signup_duplicate_race_requires_verifying_same_account(self):
        api = FakeApi(self.seed)
        original = api.call
        raced = False
        def call(method, path, body=None, token=None):
            nonlocal raced
            if path == "/api/auth/signup" and not raced:
                raced = True
                original(method, path, body, token)
                raise self.seed.SeedError("중복", status=409)
            return original(method, path, body, token)
        api.call = call
        result = self.seed.seed(api, "fake-test-password")
        self.assertEqual(result["reviews_created"], 10)
        self.assertEqual(len(api.users), 2)

    def test_review_duplicate_race_requires_exact_saved_content(self):
        api = FakeApi(self.seed)
        original = api.call
        raced = False
        def call(method, path, body=None, token=None):
            nonlocal raced
            if path == "/api/reviews" and not raced:
                raced = True
                original(method, path, body, token)
                raise self.seed.SeedError("중복", status=400)
            return original(method, path, body, token)
        api.call = call
        result = self.seed.seed(api, "fake-test-password")
        self.assertEqual(result["reviews_created"], 9)
        self.assertEqual(result["reviews_skipped"], 1)
        self.assertEqual(sum(map(len, api.reviews.values())), 10)

    def test_review_data_matches_existing_dto_limits_and_distinct_viewpoints(self):
        payloads = [self.seed.review_payloads(i) for i in range(2)]
        self.assertEqual([len(rows) for rows in payloads], [5, 5])
        for i in range(5):
            self.assertNotEqual(payloads[0][i]["content"], payloads[1][i]["content"])
        for row in payloads[0] + payloads[1]:
            self.assertEqual(set(row), {"movieCode", "title", "content"})
            self.assertRegex(row["movieCode"], r"^[A-Za-z0-9]{8}$")
            self.assertLessEqual(len(row["title"]), 100)
            self.assertLessEqual(len(row["content"]), 2000)
            for aspect in ("연기", "촬영", "음악", "연출", "스토리"):
                self.assertIn(aspect, row["content"])


class FakeApi:
    """실제 API 응답 모양과 회원별 페이지 분리를 재현한다."""
    def __init__(self, seed):
        self.seed = seed
        self.users = {}
        self.reviews = {}
        self.writes = 0
        self.bad_movie = False

    def call(self, method, path, body=None, token=None):
        if path.startswith("/api/movies/"):
            movie = next(m for m in self.seed.MOVIES if path.endswith(m["movieCode"]))
            return {**movie, "title": "다른 영화" if self.bad_movie else movie["title"]}
        if path.startswith("/api/auth/exists/id/"):
            return path.rsplit("/", 1)[1] in self.users
        if path == "/api/auth/signup":
            self.writes += 1
            user = {**body, "userId": len(self.users) + 1, "provider": "LOCAL"}
            self.users[user["loginId"]] = user
            return user
        if path == "/api/auth/login":
            user = self.users[body["loginId"]]
            if user["password"] != body["password"]:
                raise self.seed.SeedError("로그인 실패")
            return {**user, "accessToken": str(user["userId"])}
        user = next(u for u in self.users.values() if str(u["userId"]) == token)
        if path == "/api/auth/me":
            return user
        if path.startswith("/api/reviews/me?page="):
            # 작은 페이지로 두 번째 페이지 누락에 의한 중복 생성도 잡는다.
            page = int(path.split("=")[1])
            rows = self.reviews.get(user["userId"], [])
            return {"content": copy.deepcopy(rows[page * 2:page * 2 + 2]),
                    "last": (page + 1) * 2 >= len(rows)}
        if path == "/api/reviews" and method == "POST":
            self.writes += 1
            rows = self.reviews.setdefault(user["userId"], [])
            review = {**body, "reviewId": len(rows) + 1, "userId": user["userId"]}
            rows.append(review)
            return review
        raise AssertionError((method, path))


if __name__ == "__main__":
    unittest.main()
