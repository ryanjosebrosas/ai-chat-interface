'use client';

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ConversationList } from '@/components/sidebar/ConversationList';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useState } from 'react';

export default function Home() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);
  const [listKey, setListKey] = useState(0);

  const handleNewConversation = () => {
    console.log('Starting new conversation (blank slate)');

    // Clear the selected conversation (null = new blank conversation)
    setSelectedConversationId(null);

    // Force ChatInterface to reset by changing the key
    setConversationKey(prev => prev + 1);
  };

  const handleConversationSelect = (id: string) => {
    console.log('Selecting conversation:', id);
    setSelectedConversationId(id);
    // Force ChatInterface to reload with new conversation
    setConversationKey(prev => prev + 1);
  };

  const handleConversationUpdate = () => {
    console.log('Conversation updated, refreshing list');
    // Trigger a refresh of the conversation list
    setListKey(prev => prev + 1);
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800">
          <ConversationList
            key={listKey}
            selectedId={selectedConversationId}
            onSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Chat Interface
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Powered by Azure OpenAI GPT-4o
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Settings"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Chat Area */}
          <main className="flex-1 overflow-hidden">
            <ChatInterface
              key={conversationKey}
              conversationId={selectedConversationId}
              onConversationUpdate={handleConversationUpdate}
            />
          </main>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </ThemeProvider>
  );
}
