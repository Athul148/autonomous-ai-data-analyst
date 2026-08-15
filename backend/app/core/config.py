from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from .env
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # ==========================
    # Database
    # ==========================

    DATABASE_HOST: str = Field(...)
    DATABASE_PORT: int = Field(...)
    DATABASE_NAME: str = Field(...)
    DATABASE_USER: str = Field(...)
    DATABASE_PASSWORD: str = Field(...)

    # ==========================
    # Security
    # ==========================

    SECRET_KEY: str = Field(...)
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # ==========================
    # Storage
    # ==========================

    UPLOAD_DIR: str = Field(default="uploads")
    SNAPSHOTS_DIR: str = Field(default="snapshots")
    REPORTS_DIR: str = Field(default="reports")

    # ==========================
    # AI
    # ==========================

    GEMINI_API_KEY: str = Field(...)
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://"
            f"{self.DATABASE_USER}:"
            f"{self.DATABASE_PASSWORD}@"
            f"{self.DATABASE_HOST}:"
            f"{self.DATABASE_PORT}/"
            f"{self.DATABASE_NAME}"
        )


@lru_cache
def get_settings() -> Settings:
    """
    Cache settings so they are loaded only once.
    """
    return Settings()


settings = get_settings()