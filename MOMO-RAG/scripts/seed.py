"""로컬 테스트 DB용 회원 2명·실제 영화 5편·감상 리뷰 10개를 Spring API로 등록한다.

기본 실행은 네트워크 없는 미리보기다. 실제 등록 예:
  python scripts/seed.py --execute --confirm-local-test-db --base-url http://localhost:8111

비밀번호는 MOMO_SEED_PASSWORD 환경변수 또는 숨김 입력으로 받고 저장하지 않는다.
같은 비밀번호를 다시 사용해야 기존 시드 회원을 확인하고 중복 없이 재실행할 수 있다.
로컬 URL만으로 Spring의 DB 접속 대상을 판별할 수 없으므로 운영자가 직접 별도
로컬 테스트 DB 연결을 확인해야 한다. Atlas 모드의 리뷰 등록은 유료 임베딩을
유발할 수 있다. 무료 확인에는 RAG_ENGINE=stub을 사용한다. 영화 상세 확인은
Spring의 기존 외부 영화 API·캐시를 사용할 수 있다. 이 파일은 DB나 FastAPI를
직접 호출하지 않으며 기존 회원·리뷰를 수정하거나 삭제하지 않는다.
"""
import argparse
import getpass
import ipaddress
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


# KOBIS 영화 코드다. 실행 시 Spring의 영화 상세 응답과 코드·제목을 다시 대조한다.
MOVIES = (
    {"movieCode": "20183782", "title": "기생충"},
    {"movieCode": "20149120", "title": "인터스텔라"},
    {"movieCode": "20182530", "title": "극한직업"},
    {"movieCode": "20161872", "title": "라라랜드"},
    {"movieCode": "20135428", "title": "겨울왕국"},
)

MEMBERS = (
    {"loginId": "momoRagSeedA", "nickname": "시드감상A", "email": "momo-rag-seed-a@example.invalid"},
    {"loginId": "momoRagSeedB", "nickname": "시드감상B", "email": "momo-rag-seed-b@example.invalid"},
)

# 모두 시연을 위해 작성한 가상 감상이다. 두 회원의 관점 차이를 ALL/MINE 검색에 쓴다.
OPINIONS = (
    (
        ("공간과 표정으로 쌓이는 긴장", "배우들의 작은 표정 변화가 대사보다 많은 감정을 전해 연기가 설득력 있었다. "
         "계단과 창문을 담는 촬영에서 인물의 거리감이 선명하게 느껴졌다. 음악은 불안을 조금씩 키워 몰입에 도움이 됐다. "
         "웃음에서 긴장으로 넘어가는 연출이 자연스러웠고, 스토리의 예상 밖 전환이 오래 기억에 남았다."),
        ("우주 풍경보다 오래 남은 가족의 감정", "가족을 그리워하는 배우의 연기가 가장 인상적이었다. 우주의 넓이를 강조한 촬영은 "
         "큰 화면으로 보고 싶게 했다. 음악이 장면의 긴박함을 끌어올려 좋았다. 시간의 차이를 체감하게 하는 연출이 흥미로웠고, "
         "스토리의 가족 서사가 복잡한 설정을 따라갈 동력이 됐다."),
        ("배우들의 호흡이 살린 코미디", "배우들이 대사를 주고받는 연기의 박자가 잘 맞아 자주 웃었다. 촬영은 인물의 반응을 "
         "알아보기 쉽게 잡아 편하게 볼 수 있었다. 음악이 코믹한 분위기를 받쳐 주면서 지나치게 튀지 않아 좋았다. "
         "연출의 빠른 호흡과 단순명료한 스토리 덕분에 가볍게 즐길 수 있었다."),
        ("색과 음악으로 기억되는 선택", "주인공들의 어색함과 설렘을 드러내는 연기가 좋았다. 색을 강하게 활용한 촬영이 "
         "장면마다 다른 감정을 느끼게 했다. 음악은 감정의 변화를 가장 선명하게 전달한 요소였다. "
         "현실과 상상을 오가는 연출이 매력적이었고, 꿈과 관계 사이에서 선택하는 스토리에 공감했다."),
        ("노래와 색채가 전하는 자매의 마음", "목소리 연기가 인물들의 두려움과 용기를 잘 전한다고 느꼈다. 눈과 얼음을 표현하는 "
         "화면의 구도와 색채, 촬영의 시점이 시원했다. 음악은 인물의 감정을 따라 이해하기 쉽게 만들었다. "
         "밝은 장면과 긴장 장면을 번갈아 배치한 연출이 좋았고, 자매의 관계를 중심에 둔 스토리가 따뜻했다."),
    ),
    (
        ("정교하지만 감정의 거리가 남았다", "배우들의 연기는 뛰어났지만 일부 인물의 반응은 내게 과장되게 느껴졌다. "
         "촬영의 공간 대비는 선명했으나 상징을 의식하게 해 몰입이 잠시 끊겼다. 음악은 긴장을 잘 만들면서도 때로 부담스러웠다. "
         "후반 연출의 강한 전환은 취향에 맞지 않았고, 스토리를 인물보다 장치 중심으로 받아들였다."),
        ("멋진 화면에 비해 설명이 벅찼다", "중심 배우의 감정 연기는 좋았지만 주변 인물의 마음은 충분히 따라가기 어려웠다. "
         "우주 촬영과 화면 구성은 훌륭했으나 긴 장면에서는 피로했다. 음악이 웅장한 대신 대사에 집중하기 어려운 순간도 있었다. "
         "연출의 규모보다 인물 설명을 더 원했고, 스토리 후반의 설정과 감정 연결은 다소 급하게 느껴졌다."),
        ("웃음은 좋았지만 반복은 아쉬웠다", "배우들의 코믹 연기는 즐거웠지만 비슷한 반응이 반복되면 웃음이 줄었다. "
         "촬영은 명확했으나 시각적으로 새롭다는 인상은 적었다. 음악은 분위기에 맞지만 기억에 남는 대목은 드물었다. "
         "연출이 웃음의 간격을 조금 더 조절했으면 했고, 스토리의 갈등 해결은 쉽게 예상됐다."),
        ("음악의 매력과 서사의 아쉬움", "주인공의 감정 연기는 섬세했지만 두 사람의 관계 변화가 충분히 쌓이지 않았다고 느꼈다. "
         "촬영의 색과 구도는 아름다워도 일부 장면은 감상보다 형식이 먼저 보였다. 음악 자체는 좋았으나 노래가 흐름을 멈추는 "
         "순간도 있었다. 화려한 연출에 비해 스토리의 현실적 갈등을 더 깊게 보고 싶었다."),
        ("노래는 선명하고 갈등은 서둘렀다", "목소리 연기는 생동감 있었지만 일부 인물은 성격이 단순하게 느껴졌다. "
         "촬영의 시점과 겨울 풍경은 아름다웠지만 빠른 장면 전환은 조금 산만했다. 음악의 후렴은 잘 기억나도 비슷한 감정이 "
         "반복된다고 느꼈다. 연출이 갈등 해결에 시간을 더 썼으면 했고, 스토리의 관계 회복은 다소 갑작스러웠다."),
    ),
)


class SeedError(RuntimeError):
    """서버 응답 본문이나 비밀값을 포함하지 않는 시드 실행 오류."""
    def __init__(self, message, status=None):
        super().__init__(message)
        self.status = status


def validate_base_url(value):
    """프록시·원격 호스트·인증정보·추가 경로 없이 로컬 Spring 원점만 허용한다."""
    try:
        url = urllib.parse.urlsplit(value)
        host = url.hostname
        local = host == "localhost" or (host is not None and ipaddress.ip_address(host).is_loopback)
        valid_port = url.port is None or 1 <= url.port <= 65535
    except ValueError:
        local, valid_port = False, False
    if (not local or not valid_port or url.scheme not in ("http", "https") or url.username is not None
            or url.password is not None or url.path not in ("", "/") or url.query or url.fragment):
        raise SeedError("Spring 주소는 인증정보와 추가 경로가 없는 로컬 루프백 주소여야 합니다.")
    return value.rstrip("/")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """같은 호스트로 보내는 리다이렉트도 거부해 인증 헤더의 우회 전송을 막는다."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise SeedError("Spring 리다이렉트를 거부했습니다. 올바른 직접 주소를 확인하세요.")


class Api:
    def __init__(self, base_url):
        self.base = validate_base_url(base_url)
        self.opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())

    def call(self, method, path, body=None, token=None):
        """기존 GET/POST만 호출하며 재시도·로그·서버 오류 본문 출력은 하지 않는다."""
        if method not in ("GET", "POST") or not path.startswith("/api/"):
            raise SeedError("허용되지 않은 시드 API 요청입니다.")
        data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        request = urllib.request.Request(self.base + path, data=data, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=15) as response:
                raw = response.read(2_000_001)
                if len(raw) > 2_000_000:
                    raise SeedError("Spring 응답이 허용 크기를 초과했습니다.")
                return json.loads(raw.decode("utf-8")) if raw else None
        except urllib.error.HTTPError as failure:
            status = failure.code
            failure.close()
            raise SeedError(f"Spring API 요청 실패 (HTTP {status}).", status=status) from None
        except (urllib.error.URLError, TimeoutError, OSError, ValueError):
            raise SeedError("Spring 연결 또는 JSON 응답 확인에 실패했습니다.") from None


def review_payloads(member_index):
    return [{"movieCode": movie["movieCode"], "title": f"[RAG시드 {chr(65 + member_index)}] {movie['title']} — {title}",
             "content": "[로컬 RAG 시연용 가상 감상] " + content}
            for movie, (title, content) in zip(MOVIES, OPINIONS[member_index])]


def login_verified(api, member, password):
    """비밀번호 로그인과 본인 프로필이 모두 일치해야 기존 시드 회원으로 인정한다."""
    session = api.call("POST", "/api/auth/login", {"loginId": member["loginId"], "password": password})
    if not isinstance(session, dict) or not isinstance(session.get("accessToken"), str) or not session["accessToken"]:
        raise SeedError("시드 회원 로그인 응답을 확인할 수 없습니다.")
    profile = api.call("GET", "/api/auth/me", token=session["accessToken"])
    if (not isinstance(profile, dict) or any(profile.get(k) != v for k, v in member.items())
            or profile.get("provider") != "LOCAL" or type(profile.get("userId")) is not int
            or profile["userId"] <= 0):
        raise SeedError("이미 존재하는 회원이 시드 프로필과 다릅니다. 기존 회원은 변경하지 않습니다.")
    return session["accessToken"], profile["userId"]


def my_reviews(api, token, user_id):
    """모든 페이지를 조회하고 본인 소유 응답인지 확인한 뒤 중복 여부를 판단한다."""
    result = []
    for page in range(1000):
        response = api.call("GET", f"/api/reviews/me?page={page}", token=token)
        if (not isinstance(response, dict) or not isinstance(response.get("content"), list)
                or type(response.get("last")) is not bool):
            raise SeedError("내 리뷰 페이지 응답 형식이 예상과 다릅니다.")
        rows = response["content"]
        if any(not isinstance(row, dict) or row.get("userId") != user_id for row in rows):
            raise SeedError("내 리뷰의 소유자를 확인할 수 없습니다.")
        result.extend(rows)
        if response["last"]:
            return result
        if not rows:
            break
    raise SeedError("내 리뷰 전체 페이지를 확인하지 못했습니다.")


def seed(api, password):
    """충돌은 수정·삭제로 해결하지 않고 중단한다. 정확히 일치하는 리뷰만 건너뛴다."""
    if len(password) < 8:
        raise SeedError("시드 회원 비밀번호는 8자 이상이어야 합니다.")
    for movie in MOVIES:
        response = api.call("GET", f"/api/movies/{movie['movieCode']}")
        if not isinstance(response, dict) or any(response.get(key) != value for key, value in movie.items()):
            raise SeedError("영화 상세의 코드·제목이 시드 영화와 다릅니다. 회원 등록 전에 중단했습니다.")

    # 이미 존재하는 두 회원을 먼저 확인해 점유된 계정 때문에 불필요하게 가입하지 않는다.
    sessions, missing = {}, []
    for i, member in enumerate(MEMBERS):
        exists = api.call("GET", f"/api/auth/exists/id/{member['loginId']}")
        if type(exists) is not bool:
            raise SeedError("아이디 중복 확인 응답이 예상과 다릅니다.")
        if exists:
            sessions[i] = login_verified(api, member, password)
        else:
            missing.append(i)
    counts = {"members_created": 0, "reviews_created": 0, "reviews_skipped": 0}
    for i in missing:
        member = MEMBERS[i]
        try:
            api.call("POST", "/api/auth/signup", {**member, "password": password})
            counts["members_created"] += 1
        except SeedError as failure:
            # 중복 경쟁이라도 같은 계정의 재확인·로그인이 성공할 때만 계속한다.
            if failure.status not in (400, 409) or api.call("GET", f"/api/auth/exists/id/{member['loginId']}") is not True:
                raise
        sessions[i] = login_verified(api, member, password)

    pending = []
    for i, (token, user_id) in sessions.items():
        existing = my_reviews(api, token, user_id)
        for payload in review_payloads(i):
            matches = [row for row in existing if row.get("movieCode") == payload["movieCode"]]
            if matches:
                if len(matches) != 1 or any(matches[0].get(key) != value for key, value in payload.items()):
                    raise SeedError("시드 영화에 다른 리뷰가 이미 있습니다. 기존 리뷰를 보존하고 중단합니다.")
                counts["reviews_skipped"] += 1
            else:
                pending.append((token, user_id, payload))
    for token, user_id, payload in pending:
        try:
            saved = api.call("POST", "/api/reviews", payload, token=token)
        except SeedError as failure:
            if failure.status not in (400, 409):
                raise
            matches = [row for row in my_reviews(api, token, user_id)
                       if row.get("movieCode") == payload["movieCode"]]
            if len(matches) != 1 or any(matches[0].get(key) != value for key, value in payload.items()):
                raise SeedError("리뷰 등록 충돌이 발생했습니다. 기존 리뷰는 변경하지 않습니다.") from None
            counts["reviews_skipped"] += 1
            continue
        if (not isinstance(saved, dict) or saved.get("userId") != user_id
                or any(saved.get(key) != value for key, value in payload.items())):
            raise SeedError("등록된 리뷰 응답이 예상과 다릅니다. 재실행 전에 내 리뷰를 확인하세요.")
        counts["reviews_created"] += 1
    return counts


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base-url", default="http://localhost:8111")
    parser.add_argument("--execute", action="store_true", help="실제 회원·리뷰 등록 (기본은 네트워크 없는 미리보기)")
    parser.add_argument("--confirm-local-test-db", action="store_true", help="Spring이 별도 로컬 테스트 DB에 연결되었음을 운영자가 확인")
    args = parser.parse_args(argv)
    base = validate_base_url(args.base_url)
    if not args.execute:
        print("미리보기: 회원 2명, 영화 5편, 리뷰 10개. 네트워크 요청을 실행하지 않았습니다.")
        for movie in MOVIES:
            print(f"  {movie['movieCode']} {movie['title']}")
        print("실제 등록은 --execute --confirm-local-test-db를 함께 지정하세요.")
        return 0
    if not args.confirm_local_test_db:
        raise SeedError("Spring의 별도 로컬 테스트 DB 연결을 직접 확인하고 --confirm-local-test-db를 지정하세요.")
    password = os.environ.get("MOMO_SEED_PASSWORD") or getpass.getpass("재실행에도 사용할 테스트 회원 비밀번호: ")
    result = seed(Api(base), password)
    print(f"완료: 회원 생성 {result['members_created']}, 리뷰 생성 {result['reviews_created']}, 동일 리뷰 건너뜀 {result['reviews_skipped']}.")
    print("색인 완료를 기다린 뒤 각 리뷰의 READY 상태와 AI 도우미 ALL/MINE 검색을 확인하세요.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SeedError as failure:
        print(f"시드 중단: {failure}", file=sys.stderr)
        raise SystemExit(1) from None
