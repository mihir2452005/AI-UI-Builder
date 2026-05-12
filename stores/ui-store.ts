/**
 * UI Store
 * 
 * Manages UI state including:
 * - Sidebar and panel visibility
 * - Modal states (export, save, suggestions)
 * - Active modal tracking
 * 
 * Requirements:
 * - 3.1: Component library sidebar
 * - 7.10: Export modal
 * - 9.6: Suggestions panel
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Modal types supported by the application
 */
export type ModalType = 'export' | 'save' | 'suggestions' | 'settings' | null;

/**
 * Modal data payload (can be extended for specific modal types)
 */
export interface ModalData {
  [key: string]: unknown;
}

interface UIState {
  // Panel visibility
  sidebarVisible: boolean;
  propertiesPanelVisible: boolean;
  
  // Modal state
  activeModal: ModalType;
  modalData: ModalData | null;
  
  // Actions - Panels
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  togglePropertiesPanel: () => void;
  setPropertiesPanelVisible: (visible: boolean) => void;
  
  // Actions - Modals
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  setModalData: (data: ModalData) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      sidebarVisible: true,
      propertiesPanelVisible: true,
      activeModal: null,
      modalData: null,
      
      // Panel actions
      toggleSidebar: () => {
        set((state) => ({
          sidebarVisible: !state.sidebarVisible,
        }));
      },
      
      setSidebarVisible: (visible: boolean) => {
        set({ sidebarVisible: visible });
      },
      
      togglePropertiesPanel: () => {
        set((state) => ({
          propertiesPanelVisible: !state.propertiesPanelVisible,
        }));
      },
      
      setPropertiesPanelVisible: (visible: boolean) => {
        set({ propertiesPanelVisible: visible });
      },
      
      // Modal actions
      openModal: (type: ModalType, data?: ModalData) => {
        set({
          activeModal: type,
          modalData: data || null,
        });
      },
      
      closeModal: () => {
        set({
          activeModal: null,
          modalData: null,
        });
      },
      
      setModalData: (data: ModalData) => {
        set({ modalData: data });
      },
    }),
    {
      name: 'UIStore',
    }
  )
);
