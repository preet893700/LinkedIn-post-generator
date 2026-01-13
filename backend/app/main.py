"""
FastAPI Backend for LinkedIn Post Generator
Main application entry point
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --------------------------------------------------
# EXPLICIT ROUTER IMPORTS (BEST PRACTICE)
# --------------------------------------------------

from app.api.generate import router as generate_router
from app.api.rewrite import router as rewrite_router          # legacy
from app.api.generate_topic import router as topic_router
from app.api.edit_actions import router as edit_router
from app.api.generate_from_reference import router as reference_router

# --------------------------------------------------
# LOGGING CONFIGURATION
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# --------------------------------------------------
# FASTAPI APP
# --------------------------------------------------

app = FastAPI(
    title="LinkedIn Post Generator API",
    description="AI-powered LinkedIn post generation & editing with Ollama → Gemini fallback",
    version="1.2.0"
)

# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

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

# --------------------------------------------------
# ROUTER REGISTRATION
# --------------------------------------------------

# 1️⃣ Basic generation (template-based)
app.include_router(
    generate_router,
    prefix="/api",
    tags=["Generate"]
)

# 2️⃣ Topic-based generation
app.include_router(
    topic_router,
    prefix="/api",
    tags=["Topic Generation"]
)

# 3️⃣ Style transfer (reference post)
app.include_router(
    reference_router,
    prefix="/api",
    tags=["Style Transfer"]
)

# 4️⃣ Post editing actions (new system)
app.include_router(
    edit_router,
    prefix="/api",
    tags=["Post Editing"]
)

# 5️⃣ Legacy rewrite (can be deprecated later)
app.include_router(
    rewrite_router,
    prefix="/api",
    tags=["Rewrite (Legacy)"]
)

# --------------------------------------------------
# ROOT & HEALTH
# --------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "LinkedIn Post Generator API",
        "status": "running",
        "version": "1.2.0",
        "endpoints": {
            "generate": "/api/generate",
            "generate_topic": "/api/generate/topic",
            "generate_from_reference": "/api/generate/from-reference",
            "edit": {
                "shorten": "/api/edit/shorten",
                "expand": "/api/edit/expand",
                "improve": "/api/edit/improve",
                "rephrase": "/api/edit/rephrase",
                "fix_grammar": "/api/edit/fix-grammar",
                "simplify": "/api/edit/simplify",
                "add_emojis": "/api/edit/add-emojis",
                "add_hashtags": "/api/edit/add-hashtags"
            },
            "rewrite_legacy": "/api/rewrite"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# --------------------------------------------------
# LOCAL DEVELOPMENT ENTRY
# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
