# Deployment Guide

This guide covers how to deploy the AI Chat Interface application.

## Prerequisites

- Node.js 20+ installed
- Python 3.11+ installed
- Azure OpenAI account with deployment
- Supabase project set up
- Git for version control

## Step 1: Environment Setup

1. Copy the environment variables template:
```bash
cp .env.local.example .env.local
```

2. Fill in the environment variables with your actual values:
   - Azure OpenAI API key and deployment details
   - Supabase URL and API keys
   - CopilotKit key (optional)

## Step 2: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `scripts/setup-db.sql`
4. Run the SQL script to create tables and set up RLS policies

## Step 3: Install Dependencies

### Frontend (Next.js)
```bash
npm install
```

### Backend (PydanticAI Agent Server)
```bash
cd lib/pydantic-ai
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Step 4: Validation

Run the following commands to ensure everything is set up correctly:

```bash
# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Build the project
npm run build
```

## Step 5: Run Development Servers

### Terminal 1: Next.js Frontend
```bash
npm run dev
```

### Terminal 2: PydanticAI Agent Server
```bash
cd lib/pydantic-ai
python server.py
```

The application will be available at:
- Frontend: http://localhost:3000
- Agent API: http://localhost:8000
- Agent API Docs: http://localhost:8000/docs

## Step 6: Production Deployment

### Option 1: Vercel (Recommended for Next.js)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

4. Deploy the Python agent server separately (see Option 3)

### Option 2: Docker Deployment

Create a `Dockerfile` for the Next.js app:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t chat-interface .
docker run -p 3000:3000 --env-file .env.local chat-interface
```

### Option 3: Python Agent Server Deployment

Deploy the PydanticAI agent server using:
- **Railway**: Easy Python deployment
- **Render**: Free tier available
- **Fly.io**: Global deployment
- **Azure App Service**: If using Azure ecosystem

Example for Railway:
1. Create `Procfile` in `lib/pydantic-ai/`:
```
web: python server.py
```

2. Add `runtime.txt`:
```
python-3.11
```

3. Deploy via Railway CLI or GitHub integration

## Step 7: Post-Deployment

1. Test the chat functionality
2. Verify Supabase connections
3. Check Azure OpenAI integration
4. Test PydanticAI agent endpoints

## Environment Variables for Production

Ensure these are set in your production environment:

```bash
# Azure OpenAI
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT_NAME=
AZURE_RESOURCE_NAME=
AZURE_OPENAI_API_VERSION=2024-08-01-preview

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Python Agent (Update with production URL)
PYDANTIC_AGENT_URL=https://your-agent-server.com

# Optional
NEXT_PUBLIC_COPILOTKIT_KEY=
NODE_ENV=production
```

## Monitoring and Maintenance

- Set up error tracking (e.g., Sentry)
- Monitor Azure OpenAI usage and costs
- Check Supabase database size and RLS policies
- Review logs regularly

## Troubleshooting

### Common Issues

1. **CORS errors**: Check API routes and middleware configuration
2. **Supabase connection failures**: Verify environment variables
3. **Azure OpenAI rate limits**: Implement retry logic (already included)
4. **PydanticAI server not reachable**: Check PYDANTIC_AGENT_URL

## Security Checklist

- [ ] All environment variables are set
- [ ] Supabase RLS policies are enabled
- [ ] API routes have proper error handling
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured (if needed)

## Performance Optimization

- Enable caching for static assets
- Use CDN for public files
- Configure Next.js Image Optimization
- Monitor bundle size with `npm run build`

## Support

For issues and questions:
- Check the [README](./README.md) for basic setup
- Review the [PRP document](../PRPs/modern-chat-interface.md)
- Open an issue on GitHub
