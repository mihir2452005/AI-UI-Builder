'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{
    success: boolean;
    uiDocument: unknown;
    tokensUsed: number;
    generationTime: number;
    cached: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAIEngine = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate UI');
      }

      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Prompt Engine Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test AI Generation</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Enter a prompt:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 h-32"
              placeholder="e.g., Create a hero section with a heading and button"
            />
          </div>

          <button
            onClick={testAIEngine}
            disabled={loading || !prompt}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Test AI Engine'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Result</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Tokens Used</p>
                <p className="text-2xl font-bold">{result.tokensUsed || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Generation Time</p>
                <p className="text-2xl font-bold">{result.generationTime || 0}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cached</p>
                <p className="text-2xl font-bold">{result.cached ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Components</p>
                <p className="text-2xl font-bold">
                  {result.uiDocument?.root?.children?.length || 0}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Generated UI Document:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                {JSON.stringify(result.uiDocument, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">ℹ️ Test Information</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• This page tests the AI Prompt Engine (Task 6)</li>
            <li>• It uses the configured AI provider (OpenAI or Anthropic)</li>
            <li>• Results are cached for 1 hour</li>
            <li>• Check the console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
