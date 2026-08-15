from functools import lru_cache

from pydantic import Field
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    """
    Application configuration loaded from environment
    variables or .env.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ==========================
    # Database
    # ==========================

    DATABASE_URL: str | None = Field(default=None)

    DATABASE_HOST: str | None = Field(default=None)
    DATABASE_PORT: int = Field(default=5432)
    DATABASE_NAME: str | None = Field(default=None)
    DATABASE_USER: str | None = Field(default=None)
    DATABASE_PASSWORD: str | None = Field(default=None)

    # ==========================
    # Security
    # ==========================

    SECRET_KEY: str = Field(...)

    ALGORITHM: str = Field(
        default="HS256",
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
    )

    # ==========================
    # Storage
    # ==========================

    UPLOAD_DIR: str = Field(
        default="uploads",
    )

    SNAPSHOTS_DIR: str = Field(
        default="snapshots",
    )

    REPORTS_DIR: str = Field(
        default="reports",
    )

    # ==========================
    # AI
    # ==========================

    GEMINI_API_KEY: str = Field(...)

    GEMINI_MODEL: str = Field(
        default="gemini-3.6-flash",
    )

    @property
    def database_url(self) -> str:
        """
        Use DATABASE_URL in production (Render).
        Otherwise build the URL from local database settings.
        """

        if self.DATABASE_URL:
            url = self.DATABASE_URL

            if url.startswith(
                "postgres://"
            ):
                url = url.replace(
                    "postgres://",
                    "postgresql+psycopg2://",
                    1,
                )

            elif url.startswith(
                "postgresql://"
            ):
                url = url.replace(
                    "postgresql://",
                    "postgresql+psycopg2://",
                    1,
                )

            return url

        if not all(
            [
                self.DATABASE_HOST,
                self.DATABASE_NAME,
                self.DATABASE_USER,
                self.DATABASE_PASSWORD,
            ]
        ):
            raise ValueError(
                "Database configuration is incomplete."
            )

        return (
            "postgresql+psycopg2://"
            f"{self.DATABASE_USER}:"
            f"{self.DATABASE_PASSWORD}@"
            f"{self.DATABASE_HOST}:"
            f"{self.DATABASE_PORT}/"
            f"{self.DATABASE_NAME}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()