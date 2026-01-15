"""
FastAPI Backend for LinkedIn Post Generator
Main application entry point with Authentication
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.generate import router as generate_router
from app.api.rewrite import router as rewrite_router
from app.api.generate_topic import router as topic_router
from app.api.edit_actions import router as edit_router
from app.api.generate_from_reference import router as reference_router
from app.auth.routes import router as auth_router
from app.auth.service import auth_service
from app.users.routes import router as user_router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await auth_service.connect_db()
    yield
    # Shutdown
    await auth_service.close_db()

app = FastAPI(
    title="LinkedIn Post Generator API",
    description="AI-powered LinkedIn post generation & editing with Authentication",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth routes
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    user_router,
    prefix="/user",
    tags=["User Profile"]
)

# Generation routes
app.include_router(generate_router, prefix="/api", tags=["Generate"])
app.include_router(topic_router, prefix="/api", tags=["Topic Generation"])
app.include_router(reference_router, prefix="/api", tags=["Style Transfer"])
app.include_router(edit_router, prefix="/api", tags=["Post Editing"])
app.include_router(rewrite_router, prefix="/api", tags=["Rewrite (Legacy)"])

@app.get("/")
async def root():
    return {
        "message": "LinkedIn Post Generator API with Authentication",
        "status": "running",
        "version": "2.0.0",
        "auth_endpoints": {
            "signup": "/auth/signup",
            "login": "/auth/login",
            "me": "/auth/me"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )