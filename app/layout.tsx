import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Chat Interface',
  description:
    'Modern chat interface powered by Azure OpenAI with Next.js',
  keywords: [
    'AI',
    'Chat',
    'Azure OpenAI',
    'GPT-4',
    'Next.js',
    'TypeScript',
  ],
  authors: [{ name: 'Your Name' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased">{children}</body>
    </html>
  );
}
