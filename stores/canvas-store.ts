/**
 * Canvas Store
 * 
 * Manages the canvas workspace state including:
 * - UI document and component tree
 * - Component selection and hover states
 * - Viewport and grid settings
 * - Undo/redo history (max 50 steps)
 * 
 * Requirements:
 * - 3.2: Component selection
 * - 3.3: Hover states
 * - 3.6: Drag-and-drop
 * - 4.2: Viewport switching
 * - 5.1: Grid system
 * - 5.2: Snap to grid
 * - 6.2: Undo/redo
 * - 16.1: Persistent preferences
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UIDocument, ComponentNode, Viewport } from '@/types/ui-schema';

interface CanvasState {
  // Document state
  uiDocument: UIDocument | null;
  
  // Selection state
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  
  // Viewport state
  viewport: Viewport;
  gridEnabled: boolean;
  snapToGrid: boolean;
  
  // History state (max 50 steps)
  history: UIDocument[];
  historyIndex: number;
  
  // Actions - Document
  setUIDocument: (doc: UIDocument) => void;
  updateComponent: (componentId: string, updates: Partial<ComponentNode>) => void;
  addComponent: (component: ComponentNode, parentId: string, index?: number) => void;
  removeComponent: (componentId: string) => void;
  moveComponent: (componentId: string, newParentId: string, index?: number) => void;
  
  // Actions - Selection
  selectComponent: (componentId: string | null) => void;
  setHoveredComponent: (componentId: string | null) => void;
  
  // Actions - Viewport
  setViewport: (viewport: Viewport) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  
  // Actions - History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Actions - Drag and Drop
  updateComponentPosition: (componentId: string, newParentId: string) => void;
}

const MAX_HISTORY_STEPS = 50;

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        uiDocument: null,
        selectedComponentId: null,
        hoveredComponentId: null,
        viewport: 'desktop',
        gridEnabled: false,
        snapToGrid: true,
        history: [],
        historyIndex: -1,
        
        // Document actions
        setUIDocument: (doc) => {
          set((state) => {
            // Add to history, removing any future history if we're not at the end
            const newHistory = [
              ...state.history.slice(0, state.historyIndex + 1),
              doc,
            ];
            
            // Limit history to MAX_HISTORY_STEPS
            const trimmedHistory = newHistory.slice(-MAX_HISTORY_STEPS);
            const newIndex = trimmedHistory.length - 1;
            
            return {
              uiDocument: doc,
              history: trimmedHistory,
              historyIndex: newIndex,
            };
          });
        },
        
        updateComponent: (componentId, updates) => {
          const { uiDocument } = get();
          if (!uiDocument) return;
          
          const newDoc = updateComponentInTree(uiDocument, componentId, updates);
          get().setUIDocument(newDoc);
        },
        
        addComponent: (component, parentId, index) => {
          const { uiDocument } = get();
          if (!uiDocument) return;
          
          const newDoc = addComponentToTree(uiDocument, component, parentId, index);
          get().setUIDocument(newDoc);
        },
        
        removeComponent: (componentId) => {
          const { uiDocument, selectedComponentId } = get();
          if (!uiDocument) return;
          
          const newDoc = removeComponentFromTree(uiDocument, componentId);
          get().setUIDocument(newDoc);
          
          // Clear selection if the removed component was selected
          if (selectedComponentId === componentId) {
            set({ selectedComponentId: null });
          }
        },
        
        moveComponent: (componentId, newParentId, index) => {
          const { uiDocument } = get();
          if (!uiDocument) return;
          
          const newDoc = moveComponentInTree(uiDocument, componentId, newParentId, index);
          get().setUIDocument(newDoc);
        },
        
        // Selection actions
        selectComponent: (componentId) => {
          set({ selectedComponentId: componentId });
        },
        
        setHoveredComponent: (componentId) => {
          set({ hoveredComponentId: componentId });
        },
        
        // Viewport actions
        setViewport: (viewport) => {
          set({ viewport });
        },
        
        toggleGrid: () => {
          set((state) => ({ gridEnabled: !state.gridEnabled }));
        },
        
        toggleSnapToGrid: () => {
          set((state) => ({ snapToGrid: !state.snapToGrid }));
        },
        
        // History actions
        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            set({
              uiDocument: history[newIndex],
              historyIndex: newIndex,
            });
          }
        },
        
        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            set({
              uiDocument: history[newIndex],
              historyIndex: newIndex,
            });
          }
        },
        
        canUndo: () => {
          const { historyIndex } = get();
          return historyIndex > 0;
        },
        
        canRedo: () => {
          const { history, historyIndex } = get();
          return historyIndex < history.length - 1;
        },
        
        // Drag and drop actions
        updateComponentPosition: (componentId, newParentId) => {
          get().moveComponent(componentId, newParentId);
        },
      }),
      {
        name: 'canvas-storage',
        // Only persist viewport and grid preferences, not the document or history
        partialize: (state) => ({
          viewport: state.viewport,
          gridEnabled: state.gridEnabled,
          snapToGrid: state.snapToGrid,
        }),
      }
    ),
    {
      name: 'CanvasStore',
    }
  )
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find a component node by ID in the tree
 */
function findNodeById(node: ComponentNode, id: string): ComponentNode | null {
  if (node.id === id) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Remove a node by ID from the tree (mutates the tree)
 */
function removeNodeById(node: ComponentNode, id: string): boolean {
  if (!node.children) return false;
  
  const index = node.children.findIndex((child) => child.id === id);
  if (index !== -1) {
    node.children.splice(index, 1);
    return true;
  }
  
  for (const child of node.children) {
    if (removeNodeById(child, id)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Update a component in the tree
 */
function updateComponentInTree(
  doc: UIDocument,
  componentId: string,
  updates: Partial<ComponentNode>
): UIDocument {
  // Deep clone to avoid mutations
  const newTree = JSON.parse(JSON.stringify(doc.root)) as ComponentNode;
  const component = findNodeById(newTree, componentId);
  
  if (component) {
    // Apply updates
    Object.assign(component, updates);
    
    // Mark as manually edited
    component.metadata = {
      ...component.metadata,
      manuallyEdited: true,
      updatedAt: new Date().toISOString(),
    };
  }
  
  return {
    ...doc,
    root: newTree,
    metadata: {
      ...doc.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Add a component to the tree
 */
function addComponentToTree(
  doc: UIDocument,
  component: ComponentNode,
  parentId: string,
  index?: number
): UIDocument {
  const newTree = JSON.parse(JSON.stringify(doc.root)) as ComponentNode;
  const parent = findNodeById(newTree, parentId);
  
  if (parent) {
    // Initialize children array if it doesn't exist
    if (!parent.children) {
      parent.children = [];
    }
    
    // Add component at specified index or at the end
    if (index !== undefined && index >= 0 && index <= parent.children.length) {
      parent.children.splice(index, 0, component);
    } else {
      parent.children.push(component);
    }
  }
  
  return {
    ...doc,
    root: newTree,
    metadata: {
      ...doc.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Remove a component from the tree
 */
function removeComponentFromTree(doc: UIDocument, componentId: string): UIDocument {
  const newTree = JSON.parse(JSON.stringify(doc.root)) as ComponentNode;
  
  // Don't allow removing the root component
  if (newTree.id === componentId) {
    console.warn('Cannot remove root component');
    return doc;
  }
  
  removeNodeById(newTree, componentId);
  
  return {
    ...doc,
    root: newTree,
    metadata: {
      ...doc.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Move a component to a new parent in the tree
 */
function moveComponentInTree(
  doc: UIDocument,
  componentId: string,
  newParentId: string,
  index?: number
): UIDocument {
  const newTree = JSON.parse(JSON.stringify(doc.root)) as ComponentNode;
  
  // Don't allow moving the root component
  if (newTree.id === componentId) {
    console.warn('Cannot move root component');
    return doc;
  }
  
  // Find the component to move
  const component = findNodeById(newTree, componentId);
  if (!component) {
    console.warn(`Component ${componentId} not found`);
    return doc;
  }
  
  // Don't allow moving a component into itself or its descendants
  if (componentId === newParentId || isDescendant(component, newParentId)) {
    console.warn('Cannot move component into itself or its descendants');
    return doc;
  }
  
  // Create a copy of the component
  const componentCopy = JSON.parse(JSON.stringify(component)) as ComponentNode;
  
  // Remove from old parent
  removeNodeById(newTree, componentId);
  
  // Add to new parent
  const newParent = findNodeById(newTree, newParentId);
  if (newParent) {
    if (!newParent.children) {
      newParent.children = [];
    }
    
    if (index !== undefined && index >= 0 && index <= newParent.children.length) {
      newParent.children.splice(index, 0, componentCopy);
    } else {
      newParent.children.push(componentCopy);
    }
  }
  
  return {
    ...doc,
    root: newTree,
    metadata: {
      ...doc.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Check if a node is a descendant of another node
 */
function isDescendant(node: ComponentNode, targetId: string): boolean {
  if (!node.children) return false;
  
  for (const child of node.children) {
    if (child.id === targetId) return true;
    if (isDescendant(child, targetId)) return true;
  }
  
  return false;
}
