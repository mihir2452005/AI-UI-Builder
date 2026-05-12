'use client';

/**
 * Project API Test Page
 * 
 * Simple test page to verify project management API routes work correctly
 * This is for development/testing purposes only
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestProjectsPage() {
  const [output, setOutput] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const router = useRouter();

  const log = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
    setOutput((prev) => prev + '\n\n' + logMessage);
    console.log(message, data);
  };

  const testCreateProject = async () => {
    try {
      log('Testing: POST /api/projects');
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Project ' + Date.now(),
          description: 'Created from test page',
        }),
      });

      const data = await response.json();
      log(`Response (${response.status}):`, data);

      if (data.success && data.data?.project?.id) {
        setProjectId(data.data.project.id);
        log('✅ Project created successfully!', { id: data.data.project.id });
      } else {
        log('❌ Failed to create project');
      }
    } catch (error) {
      log('❌ Error:', error);
    }
  };

  const testListProjects = async () => {
    try {
      log('Testing: GET /api/projects');
      const response = await fetch('/api/projects');
      const data = await response.json();
      log(`Response (${response.status}):`, data);

      if (data.success) {
        log(`✅ Found ${data.data?.projects?.length || 0} projects`);
      } else {
        log('❌ Failed to list projects');
      }
    } catch (error) {
      log('❌ Error:', error);
    }
  };

  const testGetProject = async () => {
    if (!projectId) {
      log('❌ No project ID set. Create a project first.');
      return;
    }

    try {
      log(`Testing: GET /api/projects/${projectId}`);
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      log(`Response (${response.status}):`, data);

      if (data.success) {
        log('✅ Project fetched successfully!');
      } else {
        log('❌ Failed to fetch project');
      }
    } catch (error) {
      log('❌ Error:', error);
    }
  };

  const testUpdateProject = async () => {
    if (!projectId) {
      log('❌ No project ID set. Create a project first.');
      return;
    }

    try {
      log(`Testing: PATCH /api/projects/${projectId}`);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Test Project ' + Date.now(),
          description: 'Updated from test page',
        }),
      });

      const data = await response.json();
      log(`Response (${response.status}):`, data);

      if (data.success) {
        log('✅ Project updated successfully!');
      } else {
        log('❌ Failed to update project');
      }
    } catch (error) {
      log('❌ Error:', error);
    }
  };

  const testDeleteProject = async () => {
    if (!projectId) {
      log('❌ No project ID set. Create a project first.');
      return;
    }

    try {
      log(`Testing: DELETE /api/projects/${projectId}`);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      log(`Response (${response.status}):`, data);

      if (data.success) {
        log('✅ Project deleted successfully!');
        setProjectId('');
      } else {
        log('❌ Failed to delete project');
      }
    } catch (error) {
      log('❌ Error:', error);
    }
  };

  const runAllTests = async () => {
    setOutput('');
    log('🚀 Starting all tests...');
    
    await testCreateProject();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testListProjects();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testGetProject();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testUpdateProject();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testGetProject();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Don't delete in run all tests so we can inspect the project
    log('✅ All tests completed! (Project not deleted for inspection)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project API Test Page
          </h1>
          <p className="text-gray-600">
            Test the project management API routes. Make sure you're signed in first.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Project ID Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Project ID:
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Project ID (auto-filled after creation)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={runAllTests}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🚀 Run All Tests
            </button>
            <button
              onClick={testCreateProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
            <button
              onClick={testListProjects}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              List Projects
            </button>
            <button
              onClick={testGetProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!projectId}
            >
              Get Project
            </button>
            <button
              onClick={testUpdateProject}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              disabled={!projectId}
            >
              Update Project
            </button>
            <button
              onClick={testDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={!projectId}
            >
              Delete Project
            </button>
          </div>
          <button
            onClick={() => setOutput('')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Output
          </button>
        </div>

        {/* Output Console */}
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Output Console
          </h2>
          <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
            {output || 'Click a button to run tests...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
