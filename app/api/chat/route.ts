import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // Get settings from localStorage (passed via request) or use env defaults
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview';

    if (!apiKey || !endpoint || !deploymentName) {
      return NextResponse.json(
        { error: 'Azure OpenAI configuration is missing. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const azureOpenAI = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion,
      deployment: deploymentName,
    });

    const completion = await azureOpenAI.chat.completions.create({
      model: deploymentName,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      content,
      model: deploymentName,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('Azure OpenAI API error:', error);

    // Check for content filtering
    if (error?.status === 400 && error?.message?.includes('content management policy')) {
      return NextResponse.json(
        {
          error: 'Your message was filtered by Azure OpenAI content policy. Please rephrase your message and try again.',
        },
        { status: 400 }
      );
    }

    // Handle rate limiting
    if (error?.status === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: error?.message || 'An unexpected error occurred. Please try again.',
      },
      { status: error?.status || 500 }
    );
  }
}
