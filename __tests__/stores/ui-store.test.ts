/**
 * UI Store Tests
 * 
 * Tests for UI store functionality including:
 * - Sidebar visibility
 * - Properties panel visibility
 * - Modal management
 */

import { useUIStore } from '@/stores/ui-store';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      sidebarVisible: true,
      propertiesPanelVisible: true,
      activeModal: null,
      modalData: null,
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar visibility', () => {
      const { toggleSidebar } = useUIStore.getState();
      
      expect(useUIStore.getState().sidebarVisible).toBe(true);
      
      toggleSidebar();
      expect(useUIStore.getState().sidebarVisible).toBe(false);
      
      toggleSidebar();
      expect(useUIStore.getState().sidebarVisible).toBe(true);
    });

    it('should set sidebar visibility directly', () => {
      const { setSidebarVisible } = useUIStore.getState();
      
      setSidebarVisible(false);
      expect(useUIStore.getState().sidebarVisible).toBe(false);
      
      setSidebarVisible(true);
      expect(useUIStore.getState().sidebarVisible).toBe(true);
    });
  });

  describe('Properties Panel Management', () => {
    it('should toggle properties panel visibility', () => {
      const { togglePropertiesPanel } = useUIStore.getState();
      
      expect(useUIStore.getState().propertiesPanelVisible).toBe(true);
      
      togglePropertiesPanel();
      expect(useUIStore.getState().propertiesPanelVisible).toBe(false);
      
      togglePropertiesPanel();
      expect(useUIStore.getState().propertiesPanelVisible).toBe(true);
    });

    it('should set properties panel visibility directly', () => {
      const { setPropertiesPanelVisible } = useUIStore.getState();
      
      setPropertiesPanelVisible(false);
      expect(useUIStore.getState().propertiesPanelVisible).toBe(false);
      
      setPropertiesPanelVisible(true);
      expect(useUIStore.getState().propertiesPanelVisible).toBe(true);
    });
  });

  describe('Modal Management', () => {
    it('should open modal without data', () => {
      const { openModal } = useUIStore.getState();
      
      openModal('export');
      
      const state = useUIStore.getState();
      expect(state.activeModal).toBe('export');
      expect(state.modalData).toBeNull();
    });

    it('should open modal with data', () => {
      const { openModal } = useUIStore.getState();
      const modalData = { projectId: 'project-1', format: 'react' };
      
      openModal('export', modalData);
      
      const state = useUIStore.getState();
      expect(state.activeModal).toBe('export');
      expect(state.modalData).toEqual(modalData);
    });

    it('should close modal and clear data', () => {
      const { openModal, closeModal } = useUIStore.getState();
      
      openModal('save', { projectName: 'My Project' });
      expect(useUIStore.getState().activeModal).toBe('save');
      
      closeModal();
      
      const state = useUIStore.getState();
      expect(state.activeModal).toBeNull();
      expect(state.modalData).toBeNull();
    });

    it('should update modal data', () => {
      const { openModal, setModalData } = useUIStore.getState();
      
      openModal('suggestions', { count: 5 });
      expect(useUIStore.getState().modalData).toEqual({ count: 5 });
      
      setModalData({ count: 10, severity: 'warning' });
      expect(useUIStore.getState().modalData).toEqual({ count: 10, severity: 'warning' });
    });

    it('should handle different modal types', () => {
      const { openModal } = useUIStore.getState();
      
      const modalTypes = ['export', 'save', 'suggestions', 'settings'] as const;
      
      modalTypes.forEach((type) => {
        openModal(type);
        expect(useUIStore.getState().activeModal).toBe(type);
      });
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();
      
      expect(state.sidebarVisible).toBe(true);
      expect(state.propertiesPanelVisible).toBe(true);
      expect(state.activeModal).toBeNull();
      expect(state.modalData).toBeNull();
    });
  });
});
