/**
 * Auto-Save Test Page
 * 
 * Demonstrates the auto-save functionality with:
 * - Live status indicator
 * - Manual save button
 * - Offline simulation
 * - Change tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { SaveStatusIndicator } from '@/components/editor/SaveStatusIndicator';
import { useCanvasStore } from '@/stores/canvas-store';
import { useProjectStore } from '@/stores/project-store';
import { 
  Save, 
  WifiOff, 
  Wifi, 
  RefreshCw,
  FileText,
  Clock,
} from 'lucide-react';

export default function TestAutoSavePage() {
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [changeCount, setChangeCount] = useState(0);
  
  const uiDocument = useCanvasStore((state) => state.uiDocument);
  const setUIDocument = useCanvasStore((state) => state.setUIDocument);
  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const currentProject = useProjectStore((state) => state.currentProject);
  
  const { 
    saveStatus, 
    isOnline, 
    lastSavedAt, 
    queuedSaves,
    forceSave,
    hasUnsavedChanges,
  } = useAutoSave({
    enabled: true,
    debounceMs: 300,
    onSaveSuccess: () => {
      // Auto-save successful
    },
    onSaveError: (error) => {
      console.error('❌ Auto-save failed:', error);
    },
  });
  
  // Simulate offline mode
  useEffect(() => {
    if (simulateOffline) {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    } else {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    }
  }, [simulateOffline]);
  
  const handleMakeChange = () => {
    if (!uiDocument) return;
    
    // Simulate a change to the document
    const updatedDoc = {
      ...uiDocument,
      metadata: {
        ...uiDocument.metadata,
        updatedAt: new Date().toISOString(),
        name: `Test Project (Change ${changeCount + 1})`,
      },
    };
    
    setUIDocument(updatedDoc);
    setChangeCount(prev => prev + 1);
  };
  
  const formatLastSaved = () => {
    if (!lastSavedAt) return 'Never';
    
    const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Auto-Save Test Page
          </h1>
          <p className="text-gray-600">
            Test the auto-save functionality with debouncing, offline queue, and status indicators
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Save Status
          </h2>
          <SaveStatusIndicator 
            showLastSaved={true}
            showQueuedCount={true}
          />
        </div>
        
        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Project Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Project ID:</span>
              <span className="font-mono text-sm text-gray-900">
                {currentProjectId || 'No project loaded'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Last Saved:</span>
              <span className="text-gray-900">
                {formatLastSaved()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Changes Made:</span>
              <span className="text-gray-900">
                {changeCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-500" />
              )}
              <span className="text-gray-600">Network Status:</span>
              <span className={isOnline ? 'text-green-600' : 'text-orange-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Make Change Button */}
            <button
              onClick={handleMakeChange}
              disabled={!currentProjectId}
              className="
                flex items-center justify-center gap-2
                px-4 py-3 rounded-lg
                bg-blue-600 text-white
                hover:bg-blue-700
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors
                font-medium
              "
            >
              <RefreshCw className="w-5 h-5" />
              Make Change (Triggers Auto-Save)
            </button>
            
            {/* Force Save Button */}
            <button
              onClick={forceSave}
              disabled={!currentProjectId || saveStatus === 'saving'}
              className="
                flex items-center justify-center gap-2
                px-4 py-3 rounded-lg
                bg-green-600 text-white
                hover:bg-green-700
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors
                font-medium
              "
            >
              <Save className="w-5 h-5" />
              Force Save Now
            </button>
            
            {/* Toggle Offline Button */}
            <button
              onClick={() => setSimulateOffline(!simulateOffline)}
              className={`
                flex items-center justify-center gap-2
                px-4 py-3 rounded-lg
                ${simulateOffline 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
                }
                text-white
                transition-colors
                font-medium
              `}
            >
              {simulateOffline ? (
                <>
                  <Wifi className="w-5 h-5" />
                  Go Online
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5" />
                  Simulate Offline
                </>
              )}
            </button>
            
            {/* Reset Button */}
            <button
              onClick={() => {
                setChangeCount(0);
                setSimulateOffline(false);
              }}
              className="
                flex items-center justify-center gap-2
                px-4 py-3 rounded-lg
                bg-gray-600 text-white
                hover:bg-gray-700
                transition-colors
                font-medium
              "
            >
              <RefreshCw className="w-5 h-5" />
              Reset Test
            </button>
          </div>
        </div>
        
        {/* Status Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status Details
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Save Status:</span>
              <span className="font-semibold text-gray-900">{saveStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Has Unsaved Changes:</span>
              <span className="font-semibold text-gray-900">
                {hasUnsavedChanges ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Queued Saves:</span>
              <span className="font-semibold text-gray-900">{queuedSaves}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Project:</span>
              <span className="font-semibold text-gray-900">
                {currentProject?.name || 'None'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How to Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Load a project from the dashboard first</li>
            <li>Click &quot;Make Change&quot; to trigger auto-save (300ms debounce)</li>
            <li>Watch the status indicator update in real-time</li>
            <li>Click &quot;Simulate Offline&quot; to test offline queue</li>
            <li>Make changes while offline to see them queue</li>
            <li>Click &quot;Go Online&quot; to see queued saves process</li>
            <li>Use &quot;Force Save Now&quot; to bypass debounce</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
