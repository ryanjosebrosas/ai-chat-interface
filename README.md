# AI Chat Interface

Modern chat interface application built with Next.js 14+, TypeScript, CopilotKit, Azure OpenAI, Supabase, and PydanticAI.

## Features

- Real-time chat interface powered by Azure OpenAI
- Conversation history management with Supabase
- Modern, responsive UI with Tailwind CSS
- Dark mode support
- PydanticAI for complex agent tasks
- Streaming responses for better UX

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript 5.6
- **Styling**: Tailwind CSS 3.4
- **UI Components**: CopilotKit 1.5
- **AI/LLM**: Azure OpenAI, PydanticAI
- **Backend/Database**: Supabase
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.11+ (for PydanticAI agents)
- Azure OpenAI account with API key
- Supabase project

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd chat-interface
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
chat-interface/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── chat/             # Chat components
│   ├── sidebar/          # Sidebar components
│   ├── providers/        # Context providers
│   └── ui/               # UI components
├── lib/                   # Utilities and configs
│   ├── supabase/         # Supabase client
│   ├── azure-openai/     # Azure OpenAI client
│   ├── pydantic-ai/      # PydanticAI agents
│   └── utils/            # Helper functions
├── types/                 # TypeScript types
└── public/               # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## License

MIT
