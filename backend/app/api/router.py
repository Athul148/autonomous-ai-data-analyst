from fastapi import APIRouter

from app.api.v1.analysis.router import (
    router as analysis_router,
)
from app.api.v1.auth.router import (
    router as auth_router,
)
from app.api.v1.datasets.router import (
    router as dataset_router,
)
from app.api.v1.reports.router import (
    router as reports_router,
)

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dataset_router)
api_router.include_router(analysis_router)
api_router.include_router(reports_router)