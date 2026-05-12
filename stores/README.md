# Stores

This directory contains Zustand state management stores for the AI-Powered UI Builder.

## Store Files

### `canvas-store.ts`
Canvas workspace state management with:
- UI document and component tree
- Component selection and hover states
- Viewport switching (mobile/desktop)
- Grid and snap-to-grid settings
- Undo/redo history (max 50 steps)
- Drag-and-drop integration
- Persistent preferences (viewport, grid settings)

**Requirements:** 3.2, 3.3, 3.6, 4.2, 5.1, 5.2, 6.2, 16.1

### `project-store.ts`
Project management state with:
- Project list and current project
- CRUD operations with API integration
- Loading and error states
- Optimistic updates for better UX
- Integration with `/api/projects` endpoints

**Requirements:** 14.1, 14.2, 14.3, 14.4, 14.7

### `ui-store.ts`
UI state management for:
- Sidebar visibility
- Properties panel visibility
- Modal states (export, save, suggestions, settings)
- Active modal tracking with data payload

**Requirements:** 3.1, 7.10, 9.6

## Usage Examples

### Canvas Store

```typescript
import { useCanvasStore } from '@/stores/canvas-store';

function MyComponent() {
  const {
    uiDocument,
    selectedComponentId,
    viewport,
    setViewport,
    selectComponent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasStore();
  
  // Use the state and actions
}
```

### Project Store

```typescript
import { useProjectStore } from '@/stores/project-store';

function MyComponent() {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectStore();
  
  // Use the state and actions
}
```

### UI Store

```typescript
import { useUIStore } from '@/stores/ui-store';

function MyComponent() {
  const {
    sidebarVisible,
    activeModal,
    toggleSidebar,
    openModal,
    closeModal,
  } = useUIStore();
  
  // Use the state and actions
}
```

## Architecture

All stores use:
- **Zustand 4.x** for state management
- **DevTools middleware** for debugging
- **TypeScript** for type safety

The canvas store additionally uses:
- **Persist middleware** for localStorage persistence of preferences
