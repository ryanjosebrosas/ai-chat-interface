import { NextRequest, NextResponse } from 'next/server';

const PYDANTIC_AGENT_URL = process.env.PYDANTIC_AGENT_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskType, content, question, context } = body;

    if (!taskType) {
      return NextResponse.json({ error: 'taskType is required' }, { status: 400 });
    }

    // Call PydanticAI agent server
    const response = await fetch(`${PYDANTIC_AGENT_URL}/complex`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_type: taskType,
        content,
        question,
        context: context || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent server responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling complex agent:', error);

    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Failed to connect to PydanticAI agent server',
          message: 'Make sure the Python agent server is running on ' + PYDANTIC_AGENT_URL,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process complex task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
