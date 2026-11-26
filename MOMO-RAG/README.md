# MOMO RAG — FastAPI 서비스

리뷰 청킹·색인·삭제와 LangGraph 검색을 제공하는 내부 서비스입니다. 기본은 **문자 2-gram 메모리 StubEngine**이며, 6차시부터 `RAG_ENGINE=atlas`를 선택해 실제 OpenAI·Atlas 구현을 사용할 수 있습니다. 실제 외부 연동은 사용자 확인 전까지 미검증입니다. 같은 리뷰 ID는 청크를 교체하고, 근거가 부족하면 최대 한 번 질문을 재작성해 재검색한 뒤 답변을 보류합니다.

5차시의 Spring 이벤트·색인 상태·단건/전체 재색인·ALL/MINE 질문 API·운영자 설정·최신 원본 검증·복구·검증 결과는 [RAG 상세 문서](../docs/RAG.md)에 모았습니다. 전체 시스템은 [아키텍처](../docs/ARCHITECTURE.md), 프로젝트 실행은 [README](../README.md)를 참고하세요.

## 로컬 실행

Python 3.14와 프로젝트 `.venv`를 사용합니다. 다른 Python 환경의 pip와 혼용하지 않습니다. 기존 가상환경이 없으면 저장소 루트에서 먼저 생성합니다.

```powershell
python -m venv .\MOMO-RAG\.venv
.\MOMO-RAG\.venv\Scripts\python.exe -m pip install -r .\MOMO-RAG\requirements.txt
Set-Location MOMO-RAG
# .env.example을 참고해 추적하지 않는 .env에 SERVICE_TOKEN을 직접 설정합니다.
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --workers 1
```

`SERVICE_TOKEN`이 없거나 비어 있으면 기동하지 않습니다. Spring의 `RAG_SERVICE_TOKEN`에 같은 비밀값을 주입하며 `RAG_ENABLED=true`로 활성화합니다. 토큰은 사용자 JWT와 별개이고 코드·문서·로그에 기록하지 않습니다.

`GET /health`는 공개이며 `POST /index`, `DELETE /index/{review_id}`, `POST /query`는 `X-Service-Token`이 필요합니다. 작성자 이메일·닉네임·MOMO JWT는 Python에 전달하지 않습니다. API 계약·타임아웃·질문 흐름은 [상세 문서](../docs/RAG.md)를 따릅니다.

## 재시작과 검증

메모리 색인은 재시작 시 사라지므로 **FastAPI 재시작 후 운영자가 Spring 전체 재색인을 실행해야 합니다.** 여러 worker 사이에 청크가 공유되지 않아 단일 worker로 실행합니다. 자동 복구·영속 큐·분산 잠금은 없습니다.

저장소 루트에서 DB 접근 없는 Python 검증을 실행합니다. pytest는 검증 환경에 별도로 필요하며 서비스 실행 의존성과 구분합니다.

```powershell
Set-Location MOMO-RAG
.\.venv\Scripts\python.exe -m pytest tests -q
```

5차시의 실제 통과 수치와 H2 통합·실제 MySQL 미검증 범위는 [검증 결과](../docs/RAG.md#실행과-검증)에서 확인합니다. 기존 리뷰·공유 DB는 이 Python 테스트의 데이터가 아닙니다.


## 6차시 엔진 전환

Stub은 외부 연결 없이 기존 테스트에 사용합니다. Atlas는 `.env.example`의 설정을 사용자가 직접 준비하고 벡터 인덱스 생성·질문 제한·전체 재색인을 마친 뒤 사용합니다. 상세 순서는 [6차시 전환·검증 절차](../docs/RAG.md#6차시-atlasopenai-전환과-사용자-검증)를 따릅니다. 실제 비밀값은 저장소·로그에 기록하지 않습니다.


## 시연 데이터

`python scripts/seed.py`는 네트워크 없는 미리보기입니다. 실제 생성은 별도 로컬 테스트 DB 연결을 사용자가 확인한 후 `python scripts/seed.py --execute --confirm-local-test-db --base-url http://localhost:8111`로 실행합니다. 전용 회원2명·동일 영화5편의 서로 다른 감상10개를 기존 Spring API로 등록하고, 기존 동일 데이터는 건너뜁니다. 기존 데이터 수정·삭제와 전체 재색인은 하지 않습니다. Atlas 모드에서는 자동 색인으로 유료 임베딩이 발생할 수 있습니다. [상세 실행 조건·예시 질문](../docs/RAG.md#시연용-seed--로컬-테스트-db에서-사용자-실행)을 먼저 확인하세요.
