"""
FastAPI Server for PydanticAI Agents

This server exposes the PydanticAI agents via HTTP endpoints
for integration with the Next.js application.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import agents
from agents import run_analysis, run_qa, AnalysisOutput, QAOutput

# Initialize FastAPI app
app = FastAPI(
    title="PydanticAI Agent Server",
    description="API server for PydanticAI agents",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request models
class AnalysisRequest(BaseModel):
    content: str
    context: Optional[Dict[str, Any]] = None


class QARequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = None


# Response models
class AnalysisResponse(BaseModel):
    success: bool
    result: Optional[AnalysisOutput] = None
    error: Optional[str] = None


class QAResponse(BaseModel):
    success: bool
    result: Optional[QAOutput] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str


# Routes
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    """
    Analyze content using PydanticAI analysis agent

    Args:
        request: AnalysisRequest with content and optional context

    Returns:
        AnalysisResponse with structured analysis or error
    """
    try:
        result = await run_analysis(request.content, request.context)
        return {
            "success": True,
            "result": result,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "result": None,
            "error": str(e)
        }


@app.post("/qa", response_model=QAResponse)
async def question_answer(request: QARequest):
    """
    Answer a question using PydanticAI Q&A agent

    Args:
        request: QARequest with question and optional context

    Returns:
        QAResponse with answer or error
    """
    try:
        result = await run_qa(request.question, request.context)
        return {
            "success": True,
            "result": result,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "result": None,
            "error": str(e)
        }


@app.post("/complex")
async def complex_task(request: dict):
    """
    Handle complex tasks that may require multiple agent calls

    This is a flexible endpoint for future complex workflows
    """
    try:
        task_type = request.get("task_type")

        if task_type == "analysis":
            result = await run_analysis(request.get("content", ""), request.get("context"))
            return {"success": True, "result": result}
        elif task_type == "qa":
            result = await run_qa(request.get("question", ""), request.get("context"))
            return {"success": True, "result": result}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown task type: {task_type}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run server
if __name__ == "__main__":
    port = int(os.getenv("PYDANTIC_AGENT_PORT", 8000))
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
