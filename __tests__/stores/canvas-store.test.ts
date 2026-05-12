/**
 * Canvas Store Tests
 * 
 * Tests for canvas store functionality including:
 * - Document management
 * - Component operations
 * - Selection state
 * - Viewport management
 * - History (undo/redo)
 */

import { useCanvasStore } from '@/stores/canvas-store';
import type { UIDocument } from '@/types/ui-schema';

describe('Canvas Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCanvasStore.setState({
      uiDocument: null,
      selectedComponentId: null,
      hoveredComponentId: null,
      viewport: 'desktop',
      gridEnabled: false,
      snapToGrid: true,
      history: [],
      historyIndex: -1,
    });
  });

  describe('Document Management', () => {
    it('should set UI document and add to history', () => {
      const mockDoc: UIDocument = {
        root: {
          id: 'root',
          type: 'Container',
          props: {},
          styles: {
            mobile: {},
          },
          children: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'user',
            manuallyEdited: false,
          },
        },
        designTokens: {
          colors: {},
          spacing: {},
          typography: {},
          shadows: {},
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          promptHistory: [],
          currentPromptIndex: 0,
        },
      };

      const { setUIDocument } = useCanvasStore.getState();
      
      setUIDocument(mockDoc);
      
      const state = useCanvasStore.getState();
      expect(state.uiDocument).toEqual(mockDoc);
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
    });

    it('should limit history to 50 steps', () => {
      const { setUIDocument } = useCanvasStore.getState();
      
      // Add 60 documents to history
      for (let i = 0; i < 60; i++) {
        const mockDoc: UIDocument = {
          root: {
            id: `root-${i}`,
            type: 'Container',
            props: {},
            styles: { mobile: {} },
            children: [],
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'user',
              manuallyEdited: false,
            },
          },
          designTokens: {
            colors: {},
            spacing: {},
            typography: {},
            shadows: {},
          },
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0',
            promptHistory: [],
            currentPromptIndex: 0,
          },
        };
        setUIDocument(mockDoc);
      }
      
      const state = useCanvasStore.getState();
      expect(state.history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Selection State', () => {
    it('should select and deselect components', () => {
      const { selectComponent } = useCanvasStore.getState();
      
      selectComponent('component-1');
      expect(useCanvasStore.getState().selectedComponentId).toBe('component-1');
      
      selectComponent(null);
      expect(useCanvasStore.getState().selectedComponentId).toBeNull();
    });

    it('should set hovered component', () => {
      const { setHoveredComponent } = useCanvasStore.getState();
      
      setHoveredComponent('component-2');
      expect(useCanvasStore.getState().hoveredComponentId).toBe('component-2');
      
      setHoveredComponent(null);
      expect(useCanvasStore.getState().hoveredComponentId).toBeNull();
    });
  });

  describe('Viewport Management', () => {
    it('should switch viewport', () => {
      const { setViewport } = useCanvasStore.getState();
      
      setViewport('mobile');
      expect(useCanvasStore.getState().viewport).toBe('mobile');
      
      setViewport('desktop');
      expect(useCanvasStore.getState().viewport).toBe('desktop');
    });

    it('should toggle grid', () => {
      const { toggleGrid } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().gridEnabled).toBe(false);
      
      toggleGrid();
      expect(useCanvasStore.getState().gridEnabled).toBe(true);
      
      toggleGrid();
      expect(useCanvasStore.getState().gridEnabled).toBe(false);
    });

    it('should toggle snap to grid', () => {
      const { toggleSnapToGrid } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().snapToGrid).toBe(true);
      
      toggleSnapToGrid();
      expect(useCanvasStore.getState().snapToGrid).toBe(false);
      
      toggleSnapToGrid();
      expect(useCanvasStore.getState().snapToGrid).toBe(true);
    });
  });

  describe('History (Undo/Redo)', () => {
    it('should undo and redo', () => {
      const { setUIDocument, undo, redo } = useCanvasStore.getState();
      
      const doc1: UIDocument = {
        root: {
          id: 'root-1',
          type: 'Container',
          props: {},
          styles: { mobile: {} },
          children: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'user',
            manuallyEdited: false,
          },
        },
        designTokens: { colors: {}, spacing: {}, typography: {}, shadows: {} },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          promptHistory: [],
          currentPromptIndex: 0,
        },
      };
      
      const doc2: UIDocument = {
        ...doc1,
        root: { ...doc1.root, id: 'root-2' },
      };
      
      setUIDocument(doc1);
      setUIDocument(doc2);
      
      expect(useCanvasStore.getState().uiDocument?.root.id).toBe('root-2');
      
      undo();
      expect(useCanvasStore.getState().uiDocument?.root.id).toBe('root-1');
      
      redo();
      expect(useCanvasStore.getState().uiDocument?.root.id).toBe('root-2');
    });

    it('should report canUndo and canRedo correctly', () => {
      const { setUIDocument } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().canUndo()).toBe(false);
      expect(useCanvasStore.getState().canRedo()).toBe(false);
      
      const doc: UIDocument = {
        root: {
          id: 'root',
          type: 'Container',
          props: {},
          styles: { mobile: {} },
          children: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'user',
            manuallyEdited: false,
          },
        },
        designTokens: { colors: {}, spacing: {}, typography: {}, shadows: {} },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          promptHistory: [],
          currentPromptIndex: 0,
        },
      };
      
      setUIDocument(doc);
      setUIDocument({ ...doc, root: { ...doc.root, id: 'root-2' } });
      
      expect(useCanvasStore.getState().canUndo()).toBe(true);
      expect(useCanvasStore.getState().canRedo()).toBe(false);
      
      useCanvasStore.getState().undo();
      
      expect(useCanvasStore.getState().canUndo()).toBe(false);
      expect(useCanvasStore.getState().canRedo()).toBe(true);
    });
  });
});
