"""
PydanticAI Agents for Complex Task Processing

This module defines PydanticAI agents that handle complex analysis tasks
using Azure OpenAI for LLM capabilities with structured outputs.
"""

from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from dotenv import load_dotenv
from openai import AsyncAzureOpenAI

# Load environment variables
load_dotenv()

# Azure OpenAI Configuration
endpoint = os.getenv('AZURE_OPENAI_ENDPOINT', 'https://ryanj-mhi94wkh-swedencentral.cognitiveservices.azure.com/')
deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4o')
subscription_key = os.getenv('AZURE_OPENAI_API_KEY', '')
api_version = os.getenv('AZURE_OPENAI_API_VERSION', '2024-12-01-preview')

# Create Azure OpenAI client
azure_client = AsyncAzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=subscription_key,
)

# Create PydanticAI model wrapper for Azure OpenAI
model = OpenAIModel(deployment, openai_client=azure_client)


class AnalysisOutput(BaseModel):
    """Structured output for document/content analysis"""
    summary: str = Field(description="Brief summary of the content (2-3 sentences)")
    key_points: List[str] = Field(description="3-5 key points extracted from the content")
    sentiment: str = Field(description="Overall sentiment: positive, negative, neutral, or mixed")
    confidence: float = Field(
        description="Confidence score between 0 and 1",
        ge=0.0,
        le=1.0
    )
    categories: Optional[List[str]] = Field(
        default=None,
        description="Relevant categories or topics"
    )


class SearchResult(BaseModel):
    """Result from knowledge base search"""
    content: str
    relevance_score: float
    source: Optional[str] = None


# Complex analysis agent
analysis_agent = Agent(
    model,
    result_type=AnalysisOutput,
    system_prompt="""
    You are an expert analyst providing thorough content analysis.

    Your analysis should:
    1. Be objective and data-driven
    2. Identify the most important insights
    3. Assess the overall sentiment accurately
    4. Provide a confidence score based on content clarity
    5. Categorize the content appropriately

    Always structure your output according to the AnalysisOutput schema.
    """
)


@analysis_agent.tool
async def search_knowledge_base(ctx: RunContext[dict], query: str) -> str:
    """
    Search the internal knowledge base for relevant information.

    Args:
        ctx: Agent runtime context with dependencies
        query: Search query string

    Returns:
        Relevant information from knowledge base
    """
    # In a production environment, this would connect to a vector database
    # or search system. For now, return a placeholder.
    knowledge_base = ctx.deps.get('knowledge_base', {}) if ctx.deps else {}

    # Simple keyword matching (replace with vector search in production)
    results = []
    for key, value in knowledge_base.items():
        if query.lower() in key.lower() or query.lower() in str(value).lower():
            results.append(f"{key}: {value}")

    if results:
        return "\n".join(results[:5])  # Return top 5 results
    return "No relevant information found in knowledge base."


@analysis_agent.tool
async def analyze_context(ctx: RunContext[dict], text: str) -> dict:
    """
    Analyze contextual information and extract insights.

    Args:
        ctx: Agent runtime context
        text: Text to analyze

    Returns:
        Dictionary with analysis results
    """
    # Basic context analysis
    words = text.split()
    sentences = text.split('.')

    return {
        "word_count": len(words),
        "sentence_count": len(sentences),
        "avg_word_length": sum(len(word) for word in words) / len(words) if words else 0,
        "has_questions": '?' in text,
        "has_exclamations": '!' in text,
    }


# Simple Q&A agent for basic queries
class QAOutput(BaseModel):
    """Structured output for Q&A responses"""
    answer: str = Field(description="Direct answer to the question")
    confidence: float = Field(description="Confidence in the answer", ge=0.0, le=1.0)
    sources: Optional[List[str]] = Field(default=None, description="Sources used")


qa_agent = Agent(
    model,
    result_type=QAOutput,
    system_prompt="""
    You are a helpful Q&A assistant. Provide clear, concise answers to questions.

    Guidelines:
    1. Answer directly and accurately
    2. Be concise but complete
    3. Admit when you're unsure (lower confidence)
    4. Cite sources when available
    """
)


# Helper function to run analysis
async def run_analysis(content: str, context: Optional[dict] = None) -> AnalysisOutput:
    """
    Run content analysis using the analysis agent.

    Args:
        content: Content to analyze
        context: Optional context dictionary with knowledge_base, etc.

    Returns:
        AnalysisOutput with structured analysis results
    """
    deps = context or {}
    result = await analysis_agent.run(content, deps=deps)
    return result.data


# Helper function to run Q&A
async def run_qa(question: str, context: Optional[dict] = None) -> QAOutput:
    """
    Get an answer to a question using the Q&A agent.

    Args:
        question: Question to answer
        context: Optional context dictionary

    Returns:
        QAOutput with answer and metadata
    """
    deps = context or {}
    result = await qa_agent.run(question, deps=deps)
    return result.data
