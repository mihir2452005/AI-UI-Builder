import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * Editor Page
 * 
 * Protected route for the UI editor workspace
 * 
 * Requirements:
 * - 13.6: Session-based access control
 * - 3.1: Canvas workspace
 * - 1.1: AI prompt-to-UI generation
 */
export default async function EditorPage() {
  // Get session on server side
  const session = await getServerSession(authOptions);

  // Double-check authentication (middleware should handle this)
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </a>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className="text-lg font-semibold">UI Editor</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                Save
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                Export Code
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Sidebar - Component Library */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
              Components
            </h2>
            <div className="space-y-2">
              <div className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer transition-colors">
                <p className="text-sm font-medium">Container</p>
                <p className="text-xs text-gray-400">Layout wrapper</p>
              </div>
              <div className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer transition-colors">
                <p className="text-sm font-medium">Button</p>
                <p className="text-xs text-gray-400">Interactive element</p>
              </div>
              <div className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer transition-colors">
                <p className="text-sm font-medium">Text</p>
                <p className="text-xs text-gray-400">Text content</p>
              </div>
              <div className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer transition-colors">
                <p className="text-sm font-medium">Image</p>
                <p className="text-xs text-gray-400">Image element</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 bg-gray-900 overflow-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Canvas Placeholder */}
              <div className="bg-white rounded-lg shadow-xl min-h-[600px] p-8">
                <div className="text-center text-gray-500 py-20">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Canvas Area
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    This is where your UI will be rendered and edited
                  </p>
                  <p className="text-xs text-gray-500">
                    Full editor implementation coming in Phase 3-10
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties Panel */}
        <aside className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
              Properties
            </h2>
            <div className="text-sm text-gray-500 text-center py-8">
              Select a component to edit its properties
            </div>
          </div>
        </aside>
      </div>

      {/* Prompt Editor - Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Describe the UI you want to create... (e.g., 'Create a hero section with a heading and CTA button')"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI-powered UI generation coming in Phase 4-6
          </p>
        </div>
      </div>
    </div>
  );
}
