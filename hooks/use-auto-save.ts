/**
 * Auto-Save Hook
 * 
 * Implements debounced auto-save functionality for canvas changes
 * 
 * Features:
 * - Debounced save (300ms delay)
 * - Offline queue with retry
 * - Save status indicators ("Saving...", "Saved", "Error")
 * - Automatic retry when connection restored
 * 
 * Requirements:
 * - 14.7: Auto-save project changes every 30 seconds
 * - 29.3: Queue changes when offline and retry when connection restored
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useCanvasStore } from '@/stores/canvas-store';
import { useProjectStore } from '@/stores/project-store';
import type { UIDocument } from '@/types/ui-schema';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface UseAutoSaveOptions {
  debounceMs?: number; // Debounce delay in milliseconds (default: 300)
  enabled?: boolean; // Enable/disable auto-save (default: true)
  onSaveSuccess?: () => void; // Callback on successful save
  onSaveError?: (error: Error) => void; // Callback on save error
}

interface QueuedSave {
  projectId: string;
  uiDocument: UIDocument;
  timestamp: number;
}

/**
 * Auto-save hook for canvas changes
 * 
 * Usage:
 * ```tsx
 * const { saveStatus, forceSave } = useAutoSave({
 *   debounceMs: 300,
 *   enabled: true,
 * });
 * ```
 */
export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const {
    debounceMs = 300,
    enabled = true,
    onSaveSuccess,
    onSaveError,
  } = options;
  
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isOnline, setIsOnline] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  const uiDocument = useCanvasStore((state) => state.uiDocument);
  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const updateProject = useProjectStore((state) => state.updateProject);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveQueueRef = useRef<QueuedSave[]>([]);
  const lastSavedDocRef = useRef<UIDocument | null>(null);
  const isSavingRef = useRef(false);
  
  /**
   * Check if document has changed since last save
   */
  const hasChanges = useCallback(() => {
    if (!uiDocument || !lastSavedDocRef.current) return true;
    
    // Compare documents by serializing (simple approach for MVP)
    const current = JSON.stringify(uiDocument);
    const last = JSON.stringify(lastSavedDocRef.current);
    
    return current !== last;
  }, [uiDocument]);
  
  /**
   * Save the current document to the server
   */
  const saveDocument = useCallback(async (
    projectId: string,
    doc: UIDocument
  ): Promise<void> => {
    if (isSavingRef.current) {
      console.log('[AutoSave] Save already in progress, skipping');
      return;
    }
    
    isSavingRef.current = true;
    setSaveStatus('saving');
    
    try {
      await updateProject(projectId, {
        uiDocument: doc,
      });
      
      lastSavedDocRef.current = doc;
      setLastSavedAt(new Date());
      setSaveStatus('saved');
      
      // Clear "saved" status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      
      onSaveSuccess?.();
    } catch (error) {
      console.error('[AutoSave] Save failed:', error);
      setSaveStatus('error');
      
      // If offline, queue the save
      if (!navigator.onLine) {
        console.log('[AutoSave] Offline detected, queueing save');
        saveQueueRef.current.push({
          projectId,
          uiDocument: doc,
          timestamp: Date.now(),
        });
        setSaveStatus('offline');
      }
      
      onSaveError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [updateProject, onSaveSuccess, onSaveError]);
  
  /**
   * Process queued saves when coming back online
   */
  const processQueue = useCallback(async () => {
    if (saveQueueRef.current.length === 0) return;
    
    console.log(`[AutoSave] Processing ${saveQueueRef.current.length} queued saves`);
    
    // Sort by timestamp (oldest first)
    const queue = [...saveQueueRef.current].sort((a, b) => a.timestamp - b.timestamp);
    
    // Clear the queue
    saveQueueRef.current = [];
    
    // Process each queued save
    for (const queuedSave of queue) {
      try {
        await saveDocument(queuedSave.projectId, queuedSave.uiDocument);
        console.log(`[AutoSave] Successfully saved queued document from ${new Date(queuedSave.timestamp).toISOString()}`);
      } catch (error) {
        console.error('[AutoSave] Failed to save queued document:', error);
        // Re-queue if still offline
        if (!navigator.onLine) {
          saveQueueRef.current.push(queuedSave);
        }
      }
    }
  }, [saveDocument]);
  
  /**
   * Force an immediate save (bypasses debounce)
   */
  const forceSave = useCallback(async () => {
    if (!currentProjectId || !uiDocument) {
      console.warn('[AutoSave] Cannot force save: no project or document');
      return;
    }
    
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    await saveDocument(currentProjectId, uiDocument);
  }, [currentProjectId, uiDocument, saveDocument]);
  
  /**
   * Debounced save effect
   */
  useEffect(() => {
    if (!enabled || !currentProjectId || !uiDocument) {
      return;
    }
    
    // Skip if no changes
    if (!hasChanges()) {
      return;
    }
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounced timer
    debounceTimerRef.current = setTimeout(() => {
      console.log('[AutoSave] Debounce timer expired, saving...');
      saveDocument(currentProjectId, uiDocument);
    }, debounceMs);
    
    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, currentProjectId, uiDocument, debounceMs, hasChanges, saveDocument]);
  
  /**
   * Online/offline detection
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('[AutoSave] Connection restored');
      setIsOnline(true);
      setSaveStatus('idle');
      
      // Process any queued saves
      processQueue();
    };
    
    const handleOffline = () => {
      console.log('[AutoSave] Connection lost');
      setIsOnline(false);
      setSaveStatus('offline');
    };
    
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return {
    saveStatus,
    isOnline,
    lastSavedAt,
    queuedSaves: saveQueueRef.current.length,
    forceSave,
    hasUnsavedChanges: hasChanges(),
  };
}
