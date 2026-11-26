"""Spring 전용 색인 API. 기본 실행은 로컬 주소에 바인딩한다."""
import logging
import secrets
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Header, HTTPException, Path, Request
from fastapi.concurrency import run_in_threadpool
from engine import StubEngine
from graph import build_graph, run_graph
from schemas import IndexRequest, IndexResponse, DeleteResponse, QueryRequest, QueryResponse
from settings import Settings


log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """프로세스당 하나의 엔진을 생성해 요청 사이의 색인을 공유한다."""
    settings = Settings()
    app.state.settings = settings
    app.state.engine = StubEngine(settings)
    # 질의 그래프의 의존성·초기화 실패가 기존 색인·삭제 API까지 중단시키지 않게 한다.
    app.state.graph = None
    try:
        app.state.graph = build_graph(app.state.engine, settings)
    except Exception as failure:
        # 토큰·질문·본문이 예외에 포함될 수 있어 오류 종류만 기록한다.
        log.error("질의 그래프 초기화 실패: %s", type(failure).__name__)
    yield


app = FastAPI(title="MOMO Review RAG (Stub)", lifespan=lifespan)


def verify_token(request: Request, x_service_token: str = Header(default="")):
    """MOMO JWT와 별개인 서버 간 토큰을 비교하며 값은 기록하지 않는다."""
    expected = request.app.state.settings.service_token
    if not secrets.compare_digest(x_service_token.encode(), expected.encode()):
        raise HTTPException(status_code=401, detail="서비스 인증 실패")


@app.get("/health")
def health():
    return {"status": "OK"}


@app.post("/index", response_model=IndexResponse, dependencies=[Depends(verify_token)])
async def index(req: IndexRequest, request: Request):
    chunks = await run_in_threadpool(request.app.state.engine.index,
                                    req.review_id, req.movie_code, req.title, req.content)
    return IndexResponse(review_id=req.review_id, chunks=chunks)


@app.delete("/index/{review_id}", response_model=DeleteResponse, dependencies=[Depends(verify_token)])
async def delete(request: Request, review_id: int = Path(gt=0)):
    deleted = await run_in_threadpool(request.app.state.engine.delete, review_id)
    return DeleteResponse(review_id=review_id, deleted=deleted)


@app.post("/query", response_model=QueryResponse, dependencies=[Depends(verify_token)])
async def query(req: QueryRequest, request: Request):
    """초기화 불가와 실행 실패를 구분하고 내부 오류 내용은 응답에 노출하지 않는다."""
    graph = request.app.state.graph
    if graph is None:
        raise HTTPException(status_code=503, detail="질의 서비스를 준비하지 못했습니다.")
    try:
        return await run_in_threadpool(run_graph, graph, req.question, req.review_ids, req.top_k)
    except Exception as failure:
        log.error("질의 처리 실패: %s", type(failure).__name__)
        raise HTTPException(status_code=500, detail="질의 처리 중 오류가 발생했습니다.") from failure
