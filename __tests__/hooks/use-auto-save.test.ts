/**
 * Auto-Save Hook Tests
 * 
 * Tests for the useAutoSave hook functionality
 * 
 * Requirements:
 * - 14.7: Auto-save project changes with debounce
 * - 29.3: Queue changes when offline and retry when connection restored
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useCanvasStore } from '@/stores/canvas-store';
import { useProjectStore } from '@/stores/project-store';
import type { UIDocument } from '@/types/ui-schema';

// Mock the stores
jest.mock('@/stores/canvas-store');
jest.mock('@/stores/project-store');

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useAutoSave', () => {
  const mockUpdateProject = jest.fn();
  const mockUIDocument: UIDocument = {
    metadata: {
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      promptHistory: [],
      currentPromptIndex: 0,
    },
    designTokens: {
      colors: {},
      spacing: {},
      typography: {},
      shadows: {},
    },
    root: {
      id: 'root',
      type: 'Container',
      props: {},
      styles: {
        mobile: {},
        desktop: {},
      },
      children: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user',
        manuallyEdited: false,
      },
    },
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock store implementations
    (useCanvasStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        uiDocument: mockUIDocument,
      })
    );
    
    (useProjectStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        currentProjectId: 'test-project-id',
        updateProject: mockUpdateProject,
      })
    );
    
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  describe('Debounced Save', () => {
    it('should debounce save calls with 300ms delay', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Initial status should be idle
      expect(result.current.saveStatus).toBe('idle');
      
      // Fast-forward time by 300ms
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for the save to complete
      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      });
      
      expect(mockUpdateProject).toHaveBeenCalledWith('test-project-id', {
        uiDocument: mockUIDocument,
      });
    });
    
    it('should reset debounce timer on rapid changes', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      
      renderHook(() => useAutoSave({ debounceMs: 300, enabled: true }));
      
      // Advance time by 100ms (not enough to trigger save)
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(mockUpdateProject).not.toHaveBeenCalled();
      
      // Advance another 100ms (still not enough)
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(mockUpdateProject).not.toHaveBeenCalled();
      
      // Advance final 100ms to reach 300ms total
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Wait for the save to complete
      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      });
    });
    
    it('should not save when disabled', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      
      renderHook(() => useAutoSave({ debounceMs: 300, enabled: false }));
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Should not have called save
      expect(mockUpdateProject).not.toHaveBeenCalled();
    });
  });
  
  describe('Save Status', () => {
    it('should update status to "saving" during save', async () => {
      mockUpdateProject.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Trigger save
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Status should be "saving"
      await waitFor(() => {
        expect(result.current.saveStatus).toBe('saving');
      });
    });
    
    it('should update status to "saved" after successful save', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Trigger save
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for save to complete
      await waitFor(() => {
        expect(result.current.saveStatus).toBe('saved');
      });
    });
    
    it('should update status to "error" on save failure', async () => {
      mockUpdateProject.mockRejectedValue(new Error('Save failed'));
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Trigger save
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for save to fail
      await waitFor(() => {
        expect(result.current.saveStatus).toBe('error');
      });
    });
  });
  
  describe('Offline Queue', () => {
    it('should queue saves when offline', async () => {
      // Set offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      
      mockUpdateProject.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Trigger save
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for save to fail and queue
      await waitFor(() => {
        expect(result.current.saveStatus).toBe('offline');
        expect(result.current.queuedSaves).toBe(1);
      });
    });
    
    it('should process queue when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      
      mockUpdateProject.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Trigger save while offline
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for save to queue
      await waitFor(() => {
        expect(result.current.queuedSaves).toBe(1);
      });
      
      // Come back online
      mockUpdateProject.mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      
      // Trigger online event
      act(() => {
        window.dispatchEvent(new Event('online'));
      });
      
      // Wait for queue to process
      await waitFor(() => {
        expect(result.current.queuedSaves).toBe(0);
        expect(mockUpdateProject).toHaveBeenCalled();
      });
    });
  });
  
  describe('Force Save', () => {
    it('should save immediately when forceSave is called', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Call forceSave
      await act(async () => {
        await result.current.forceSave();
      });
      
      // Should have saved immediately without waiting for debounce
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
    });
    
    it('should clear pending debounced save when forceSave is called', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      // Advance time partially (not enough to trigger debounced save)
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Call forceSave
      await act(async () => {
        await result.current.forceSave();
      });
      
      // Should have saved once
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      
      // Advance remaining time
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should still only have saved once (debounced save was cleared)
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Callbacks', () => {
    it('should call onSaveSuccess callback on successful save', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      const onSaveSuccess = jest.fn();
      
      renderHook(() =>
        useAutoSave({
          debounceMs: 300,
          enabled: true,
          onSaveSuccess,
        })
      );
      
      // Trigger save
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for save to complete
      await waitFor(() => {
        expect(onSaveSuccess).toHaveBeenCalledTimes(1);
      });
    });
    
    it('should call onSaveError callback on save failure', async () => {
      const error = new Error('Save failed');
      mockUpdateProject.mockRejectedValue(error);
      const onSaveError = jest.fn();
      
      renderHook(() =>
        useAutoSave({
          debounceMs: 300,
          enabled: true,
          onSaveError,
        })
      );
      
      // Trigger save
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for save to fail
      await waitFor(() => {
        expect(onSaveError).toHaveBeenCalledWith(error);
      });
    });
  });
  
  describe('Last Saved Timestamp', () => {
    it('should update lastSavedAt after successful save', async () => {
      mockUpdateProject.mockResolvedValue(undefined);
      
      const { result } = renderHook(() =>
        useAutoSave({ debounceMs: 300, enabled: true })
      );
      
      expect(result.current.lastSavedAt).toBeNull();
      
      // Trigger save
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Wait for save to complete
      await waitFor(() => {
        expect(result.current.lastSavedAt).not.toBeNull();
        expect(result.current.lastSavedAt).toBeInstanceOf(Date);
      });
    });
  });
});
