from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """서비스 토큰은 환경변수 또는 추적하지 않는 .env에서 읽는다."""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    service_token: str = Field(min_length=1)
    # 최초 검색 이후 재작성을 최대 한 번만 허용한다.
    max_rewrites: int = Field(default=1, ge=0, le=1)
    chunk_size: int = Field(default=500, ge=2)
    chunk_overlap: int = Field(default=80, ge=0)
    stub_min_score: float = Field(default=0.3, ge=0, le=1)
