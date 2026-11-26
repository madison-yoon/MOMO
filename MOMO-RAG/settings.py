from typing import Literal
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """서비스 토큰은 환경변수 또는 추적하지 않는 .env에서 읽는다."""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    service_token: str = Field(min_length=1)
    rag_engine: Literal["stub", "atlas"] = "stub"
    # 최초 검색 이후 재작성을 최대 한 번만 허용한다.
    max_rewrites: int = Field(default=1, ge=0, le=1)
    chunk_size: int = Field(default=500, ge=2)
    chunk_overlap: int = Field(default=80, ge=0)
    stub_min_score: float = Field(default=0.3, ge=0, le=1)
    min_score: float = Field(default=0.78, ge=0, le=1)
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-small"
    openai_chat_model: str = "gpt-4.1-mini"
    embedding_dimensions: int = Field(default=1536, gt=0)
    mongodb_uri: str = ""
    mongodb_db: str = "momo_rag"
    mongodb_collection: str = "review_chunks"
    atlas_index_name: str = "review_vector_index"
    embedding_timeout_seconds: float = Field(default=4, gt=0)
    rewrite_timeout_seconds: float = Field(default=5, gt=0)
    answer_timeout_seconds: float = Field(default=8, gt=0)
    mongo_timeout_seconds: float = Field(default=3, gt=0)
    index_budget_seconds: float = Field(default=12, gt=0)
    query_budget_seconds: float = Field(default=25, gt=0)
    daily_embedding_requests: int = Field(default=500, ge=0, le=500)
    daily_llm_requests: int = Field(default=200, ge=0, le=200)

    @model_validator(mode="after")
    def valid_chunking(self):
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError("chunk_overlap must be smaller than chunk_size")
        return self
