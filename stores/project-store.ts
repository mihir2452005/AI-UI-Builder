/**
 * Project Store
 * 
 * Manages project state including:
 * - Project list and current project
 * - CRUD operations with API integration
 * - Loading and error states
 * - Optimistic updates for better UX
 * 
 * Requirements:
 * - 14.1: List user projects
 * - 14.2: Create new project
 * - 14.3: Update project
 * - 14.4: Delete project
 * - 14.7: Auto-save functionality
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ProjectSummary,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  ApiResponse,
} from '@/types/api';
// import type { UIDocument } from '@/types/ui-schema';

interface ProjectState {
  // State
  projects: ProjectSummary[];
  currentProjectId: string | null;
  currentProject: ProjectDetail | null;
  loading: boolean;
  error: string | null;
  
  // Actions - Fetch
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  
  // Actions - CRUD
  createProject: (name: string, description?: string) => Promise<string>;
  updateProject: (id: string, updates: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Actions - State Management
  setCurrentProject: (id: string | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // Initial state
      projects: [],
      currentProjectId: null,
      currentProject: null,
      loading: false,
      error: null,
      
      // Fetch all projects
      fetchProjects: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch('/api/projects');
          const data: ApiResponse<{ projects: ProjectSummary[] }> = await response.json();
          
          if (data.success && data.data) {
            set({
              projects: data.data.projects,
              loading: false,
            });
          } else {
            set({
              error: data.error?.message || 'Failed to fetch projects',
              loading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch projects',
            loading: false,
          });
        }
      },
      
      // Fetch single project
      fetchProject: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`/api/projects/${id}`);
          const data: ApiResponse<{ project: ProjectDetail }> = await response.json();
          
          if (data.success && data.data) {
            set({
              currentProject: data.data.project,
              currentProjectId: id,
              loading: false,
            });
          } else {
            set({
              error: data.error?.message || 'Failed to fetch project',
              loading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch project',
            loading: false,
          });
        }
      },
      
      // Create new project
      createProject: async (name: string, description?: string) => {
        set({ loading: true, error: null });
        
        try {
          const requestBody: CreateProjectRequest = {
            name,
            description,
          };
          
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          const data: ApiResponse<{ project: ProjectDetail }> = await response.json();
          
          if (data.success && data.data) {
            const newProject = data.data.project;
            
            // Optimistic update: add to projects list
            set((state) => ({
              projects: [
                {
                  id: newProject.id,
                  name: newProject.name,
                  description: newProject.description,
                  thumbnail: newProject.thumbnail,
                  updatedAt: newProject.updatedAt,
                  componentCount: newProject.componentCount,
                  userId: newProject.userId,
                },
                ...state.projects,
              ],
              currentProject: newProject,
              currentProjectId: newProject.id,
              loading: false,
            }));
            
            return newProject.id;
          } else {
            const errorMessage = data.error?.message || 'Failed to create project';
            set({
              error: errorMessage,
              loading: false,
            });
            throw new Error(errorMessage);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },
      
      // Update project
      updateProject: async (id: string, updates: UpdateProjectRequest) => {
        const { projects, currentProject } = get();
        
        // Optimistic update
        const optimisticProjects = projects.map((p) =>
          p.id === id
            ? {
                ...p,
                name: updates.name ?? p.name,
                description: updates.description ?? p.description,
                thumbnail: updates.thumbnail ?? p.thumbnail,
                updatedAt: new Date().toISOString(),
              }
            : p
        );
        
        const optimisticCurrentProject = currentProject?.id === id && currentProject
          ? {
              ...currentProject,
              name: updates.name ?? currentProject.name,
              description: updates.description ?? currentProject.description,
              thumbnail: updates.thumbnail ?? currentProject.thumbnail,
              uiDocument: updates.uiDocument ?? currentProject.uiDocument,
              updatedAt: new Date().toISOString(),
            }
          : currentProject;
        
        set({
          projects: optimisticProjects,
          currentProject: optimisticCurrentProject,
          loading: true,
          error: null,
        });
        
        try {
          const response = await fetch(`/api/projects/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          const data: ApiResponse<{ project: ProjectDetail }> = await response.json();
          
          if (data.success && data.data) {
            const updatedProject = data.data.project;
            
            // Update with actual server response
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === id
                  ? {
                      id: updatedProject.id,
                      name: updatedProject.name,
                      description: updatedProject.description,
                      thumbnail: updatedProject.thumbnail,
                      updatedAt: updatedProject.updatedAt,
                      componentCount: updatedProject.componentCount,
                      userId: updatedProject.userId,
                    }
                  : p
              ),
              currentProject:
                state.currentProject?.id === id ? updatedProject : state.currentProject,
              loading: false,
            }));
          } else {
            // Revert optimistic update on error
            set({
              projects,
              currentProject,
              error: data.error?.message || 'Failed to update project',
              loading: false,
            });
          }
        } catch (error) {
          // Revert optimistic update on error
          set({
            projects,
            currentProject,
            error: error instanceof Error ? error.message : 'Failed to update project',
            loading: false,
          });
        }
      },
      
      // Delete project
      deleteProject: async (id: string) => {
        const { projects, currentProjectId } = get();
        
        // Optimistic update: remove from list
        const optimisticProjects = projects.filter((p) => p.id !== id);
        const optimisticCurrentProjectId = currentProjectId === id ? null : currentProjectId;
        const optimisticCurrentProject = currentProjectId === id ? null : get().currentProject;
        
        set({
          projects: optimisticProjects,
          currentProjectId: optimisticCurrentProjectId,
          currentProject: optimisticCurrentProject,
          loading: true,
          error: null,
        });
        
        try {
          const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
          });
          
          const data: ApiResponse<{ success: boolean }> = await response.json();
          
          if (data.success) {
            set({ loading: false });
          } else {
            // Revert optimistic update on error
            set({
              projects,
              currentProjectId,
              error: data.error?.message || 'Failed to delete project',
              loading: false,
            });
          }
        } catch (error) {
          // Revert optimistic update on error
          set({
            projects,
            currentProjectId,
            error: error instanceof Error ? error.message : 'Failed to delete project',
            loading: false,
          });
        }
      },
      
      // Set current project
      setCurrentProject: (id: string | null) => {
        set({
          currentProjectId: id,
          currentProject: id ? get().currentProject : null,
        });
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'ProjectStore',
    }
  )
);
