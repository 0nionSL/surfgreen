"""SurfGreen API — surf conditions made simple."""

import logging
import time
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.api.routes import debug, forecast, spots
from app.database.database import async_session_factory, init_db
from app.database.seed import seed_spots
from app.utils.logging_config import setup_logging

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request and catch unhandled errors before they become bare 500s."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start = time.perf_counter()
        logger.info("REQ %s %s", request.method, request.url.path)

        try:
            response = await call_next(request)
        except StarletteHTTPException:
            raise
        except Exception as exc:
            elapsed = (time.perf_counter() - start) * 1000
            logger.error(
                "ERR %s %s — unhandled error (%.0fms): %s\n%s",
                request.method,
                request.url.path,
                elapsed,
                exc,
                traceback.format_exc(),
            )
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "error": str(exc),
                    "path": request.url.path,
                },
            )

        elapsed = (time.perf_counter() - start) * 1000
        logger.info(
            "RES %s %s — %s (%.0fms)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("SurfGreen API starting up…")
    await init_db()
    logger.info("Database initialized")
    async with async_session_factory() as session:
        seeded = await seed_spots(session)
        if seeded:
            logger.info("Seeded %d surf spots", seeded)
        else:
            logger.info("Spots table already populated")
    logger.info("SurfGreen API ready")
    yield
    logger.info("SurfGreen API shutting down")


app = FastAPI(
    title="SurfGreen API",
    description="Simple surf forecast API for Bali and Portugal spots",
    version="0.1.1",
    lifespan=lifespan,
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Forecast routes first — /spots/{id}/forecast before /spots/{id}
app.include_router(forecast.router, prefix="/api")
app.include_router(spots.router, prefix="/api")
app.include_router(debug.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch unhandled exceptions; pass HTTPException through unchanged."""
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    logger.error(
        "Global exception on %s %s: %s\n%s",
        request.method,
        request.url.path,
        exc,
        traceback.format_exc(),
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc),
            "path": str(request.url.path),
        },
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
