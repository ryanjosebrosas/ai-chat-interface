# PydanticAI Agent Server

This directory contains the PydanticAI agents and FastAPI server for handling complex AI tasks.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

Copy the `.env.local` file from the root project directory or create a `.env` file with:

```bash
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_RESOURCE_NAME=your_resource_name
AZURE_OPENAI_API_VERSION=2024-08-01-preview
PYDANTIC_AGENT_PORT=8000
```

## Running the Server

Start the FastAPI server:

```bash
python server.py
```

The server will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Available Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health information

### Analysis
- `POST /analyze` - Analyze content and return structured insights

Request body:
```json
{
  "content": "Text to analyze...",
  "context": {
    "knowledge_base": {}
  }
}
```

### Q&A
- `POST /qa` - Answer questions with confidence scores

Request body:
```json
{
  "question": "What is...?",
  "context": {}
}
```

### Complex Tasks
- `POST /complex` - Handle multi-step or complex workflows

## Agents

### Analysis Agent
- Provides structured content analysis
- Extracts key points and sentiment
- Returns confidence scores

### Q&A Agent
- Answers questions directly
- Provides confidence metrics
- Cites sources when available

## Development

The agents use PydanticAI for structured outputs and Azure OpenAI for LLM capabilities.

For more information, see the [PydanticAI documentation](https://ai.pydantic.dev).
