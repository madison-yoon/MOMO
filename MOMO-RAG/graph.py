"""영화 리뷰 검색 결과에 따라 답변·재검색·보류로 분기하는 LangGraph."""
from __future__ import annotations

import operator
from typing import Annotated, Literal, TypedDict

from engine import ABSTAIN_MESSAGE, Chunk, StubEngine, body_of
from schemas import QueryResponse, Source
from settings import Settings


class RagState(TypedDict, total=False):
    """요청별 상태이며 최초 질문과 재작성된 검색어를 분리해 보존한다."""
    question: str
    query: str
    review_ids: list[int]
    top_k: int
    chunks: list[Chunk]
    rewrites: int
    answer: str
    abstained: bool
    sources: list[Source]
    # 노드가 반환한 기록만 순서대로 누적한다. 요청 간에는 공유하지 않는다.
    trace: Annotated[list[str], operator.add]


def build_graph(engine: StubEngine, settings: Settings):
    """시작 시 한 번 컴파일한다. 의존성 오류는 앱의 초기화 경계에서 격리한다."""
    from langgraph.graph import END, START, StateGraph

    def retrieve(state: RagState) -> dict:
        """빈 허용 목록은 엔진을 호출하지 않으며 기존 검색의 임계값을 그대로 사용한다."""
        ids = state["review_ids"]
        chunks = engine.search(state["query"], ids, state["top_k"]) if ids else []
        return {"chunks": chunks, "trace": ["retrieve"]}

    def grade(state: RagState) -> dict:
        """엔진이 임계값을 적용했으므로 검색 점수를 재계산하거나 재필터링하지 않는다."""
        return {"trace": ["grade"]}

    def route_after_grade(state: RagState) -> Literal["generate", "rewrite", "abstain"]:
        """근거가 있으면 생성하고, 허용 ID가 있을 때만 설정된 횟수까지 재검색한다."""
        if state["chunks"]:
            return "generate"
        if state["review_ids"] and state["rewrites"] < settings.max_rewrites:
            return "rewrite"
        return "abstain"

    def rewrite(state: RagState) -> dict:
        """원래 질문은 유지하고 다음 검색어와 재작성 횟수만 갱신한다."""
        return {"query": engine.rewrite(state["question"]),
                "rewrites": state["rewrites"] + 1, "trace": ["rewrite"]}

    def generate(state: RagState) -> dict:
        """검색된 청크를 근거로 모의 답변만 생성한다."""
        return {"answer": engine.generate(state["question"], state["chunks"]),
                "abstained": False, "trace": ["generate"]}

    def abstain(state: RagState) -> dict:
        """근거가 없으면 추측하지 않고 빈 출처와 함께 답변을 보류한다."""
        return {"answer": ABSTAIN_MESSAGE, "abstained": True,
                "chunks": [], "trace": ["abstain"]}

    def format_sources(state: RagState) -> dict:
        """같은 리뷰의 청크 중 최고 점수 하나만 출처로 남기고 본문 일부만 공개한다."""
        best: dict[int, Chunk] = {}
        for chunk in state["chunks"]:
            if chunk.review_id not in best or chunk.score > best[chunk.review_id].score:
                best[chunk.review_id] = chunk
        sources = [Source(review_id=c.review_id, title=c.title,
                          snippet=body_of(c.text)[:120], score=c.score)
                   for c in sorted(best.values(), key=lambda c: c.score, reverse=True)]
        return {"sources": sources, "trace": ["format"]}

    graph = StateGraph(RagState)
    for name, node in (("retrieve", retrieve), ("grade", grade), ("rewrite", rewrite),
                       ("generate", generate), ("abstain", abstain), ("format", format_sources)):
        graph.add_node(name, node)
    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "grade")
    graph.add_conditional_edges("grade", route_after_grade,
                                {"generate": "generate", "rewrite": "rewrite", "abstain": "abstain"})
    graph.add_edge("rewrite", "retrieve")
    graph.add_edge("generate", "format")
    graph.add_edge("abstain", "format")
    graph.add_edge("format", END)
    return graph.compile()


def run_graph(graph, question: str, review_ids: list[int], top_k: int) -> dict:
    """요청마다 새 상태로 실행하고 내부 검색어·청크 대신 공개 응답 필드만 반환한다."""
    result = graph.invoke({"question": question, "query": question,
                           "review_ids": review_ids, "top_k": top_k,
                           "rewrites": 0, "trace": []})
    return QueryResponse(answer=result["answer"], abstained=result["abstained"],
                         sources=result["sources"], trace=result["trace"]).model_dump()
