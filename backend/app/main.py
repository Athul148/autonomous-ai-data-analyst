import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.exceptions.handlers import (
    register_exception_handlers,
)


app = FastAPI(
    title="Autonomous AI Data Analyst API",
    version="1.0.0",
    description=(
        "Backend API for Autonomous AI Data Analyst"
    ),
)


frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)


allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


register_exception_handlers(app)

app.include_router(api_router)


@app.get(
    "/",
    tags=["Health"],
)
def root():
    return {
        "status": "success",
        "message": (
            "Autonomous AI Data Analyst API "
            "is running."
        ),
    }


@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "healthy",
    }