from pydantic import AliasChoices, BaseModel, Field


class IndexRequest(BaseModel):
    review_id: int = Field(gt=0)
    movie_code: str = Field(min_length=1, max_length=20)
    title: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=2000)
    fingerprint: str | None = Field(default=None, pattern=r"^[0-9a-f]{64}$")


class IndexResponse(BaseModel):
    review_id: int
    chunks: int


class DeleteResponse(BaseModel):
    review_id: int
    deleted: int


class QueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    # 기존 board_ids도 수용하되 둘 다 전달되면 명시적인 review_ids를 우선한다.
    review_ids: list[int] = Field(default_factory=list,
                                validation_alias=AliasChoices("review_ids", "board_ids"))
    fingerprints: dict[str, str] = Field(default_factory=dict)
    top_k: int = Field(default=5, ge=1, le=5)


class Source(BaseModel):
    """작성자 정보 없이 검색된 리뷰의 근거와 점수만 전달한다."""
    review_id: int
    title: str
    snippet: str
    score: float
    fingerprint: str | None = None


class QueryResponse(BaseModel):
    answer: str
    abstained: bool
    sources: list[Source] = Field(default_factory=list)
    trace: list[str]
