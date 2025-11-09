'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
}

const AZURE_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Previous generation flagship' },
  { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and affordable' },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    endpoint: '',
    deploymentName: 'gpt-4o',
    apiVersion: '2024-12-01-preview',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('azure-openai-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('azure-openai-settings', JSON.stringify(settings));

      // In a real app, you'd send this to your API to update the backend config
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 500));

      alert('Settings saved! Please refresh the page for changes to take effect.');
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Azure OpenAI Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Azure OpenAI Configuration
              </h3>

              {/* API Key */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) =>
                      setSettings({ ...settings, apiKey: e.target.value })
                    }
                    placeholder="Enter your Azure OpenAI API key"
                    className={cn(
                      'w-full px-4 py-2.5 pr-12 rounded-lg',
                      'bg-gray-50 dark:bg-gray-800',
                      'border border-gray-300 dark:border-gray-700',
                      'text-gray-900 dark:text-white',
                      'placeholder-gray-500 dark:placeholder-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      'transition-colors'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showApiKey ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Endpoint
                </label>
                <input
                  type="url"
                  value={settings.endpoint}
                  onChange={(e) =>
                    setSettings({ ...settings, endpoint: e.target.value })
                  }
                  placeholder="https://your-resource.openai.azure.com"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg',
                    'bg-gray-50 dark:bg-gray-800',
                    'border border-gray-300 dark:border-gray-700',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-500 dark:placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'transition-colors'
                  )}
                />
              </div>

              {/* Model Selection */}
              <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Model / Deployment
                </label>
                <select
                  value={settings.deploymentName}
                  onChange={(e) =>
                    setSettings({ ...settings, deploymentName: e.target.value })
                  }
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg',
                    'bg-gray-50 dark:bg-gray-800',
                    'border border-gray-300 dark:border-gray-700',
                    'text-gray-900 dark:text-white',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'transition-colors',
                    'cursor-pointer'
                  )}
                >
                  {AZURE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your Azure deployment name for the selected model
                </p>
              </div>

              {/* API Version */}
              <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Version
                </label>
                <input
                  type="text"
                  value={settings.apiVersion}
                  onChange={(e) =>
                    setSettings({ ...settings, apiVersion: e.target.value })
                  }
                  placeholder="2024-12-01-preview"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg',
                    'bg-gray-50 dark:bg-gray-800',
                    'border border-gray-300 dark:border-gray-700',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-500 dark:placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'transition-colors'
                  )}
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Note:</p>
                  <p>
                    These settings are stored locally in your browser. You'll need to
                    refresh the page after saving for changes to take effect.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-lg font-medium',
                  'bg-gray-100 dark:bg-gray-800',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-200 dark:hover:bg-gray-700',
                  'transition-colors'
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-lg font-medium',
                  'bg-blue-500 text-white',
                  'hover:bg-blue-600 active:bg-blue-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors'
                )}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
