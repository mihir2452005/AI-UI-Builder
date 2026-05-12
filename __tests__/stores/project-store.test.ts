/**
 * Project Store Tests
 * 
 * Tests for project store functionality including:
 * - Project fetching
 * - Project creation
 * - Project updates
 * - Project deletion
 * - Error handling
 */

import { useProjectStore } from '@/stores/project-store';

// Mock fetch globally
global.fetch = jest.fn();

describe('Project Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useProjectStore.setState({
      projects: [],
      currentProjectId: null,
      currentProject: null,
      loading: false,
      error: null,
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('State Management', () => {
    it('should initialize with empty state', () => {
      const state = useProjectStore.getState();
      
      expect(state.projects).toEqual([]);
      expect(state.currentProjectId).toBeNull();
      expect(state.currentProject).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set current project', () => {
      const { setCurrentProject } = useProjectStore.getState();
      
      setCurrentProject('project-1');
      expect(useProjectStore.getState().currentProjectId).toBe('project-1');
      
      setCurrentProject(null);
      expect(useProjectStore.getState().currentProjectId).toBeNull();
    });

    it('should clear error', () => {
      useProjectStore.setState({ error: 'Test error' });
      
      const { clearError } = useProjectStore.getState();
      clearError();
      
      expect(useProjectStore.getState().error).toBeNull();
    });
  });

  describe('Fetch Projects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          description: 'Description 1',
          thumbnail: null,
          updatedAt: new Date().toISOString(),
          componentCount: 5,
          userId: 'user-1',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { projects: mockProjects },
        }),
      });

      const { fetchProjects } = useProjectStore.getState();
      await fetchProjects();

      const state = useProjectStore.getState();
      expect(state.projects).toEqual(mockProjects);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: { message: 'Failed to fetch' },
        }),
      });

      const { fetchProjects } = useProjectStore.getState();
      await fetchProjects();

      const state = useProjectStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('Create Project', () => {
    it('should create project successfully', async () => {
      const mockProject = {
        id: 'new-project',
        name: 'New Project',
        description: 'New Description',
        thumbnail: null,
        updatedAt: new Date().toISOString(),
        componentCount: 0,
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        uiDocument: {
          root: {
            id: 'root',
            type: 'Container' as const,
            props: {},
            styles: { mobile: {} },
            children: [],
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'user' as const,
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
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { project: mockProject },
        }),
      });

      const { createProject } = useProjectStore.getState();
      const projectId = await createProject('New Project', 'New Description');

      expect(projectId).toBe('new-project');
      
      const state = useProjectStore.getState();
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0].name).toBe('New Project');
      expect(state.currentProjectId).toBe('new-project');
    });

    it('should handle create error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: { message: 'Failed to create' },
        }),
      });

      const { createProject } = useProjectStore.getState();
      
      await expect(createProject('New Project')).rejects.toThrow('Failed to create');
      
      const state = useProjectStore.getState();
      expect(state.error).toBe('Failed to create');
    });
  });

  describe('Update Project', () => {
    it('should update project with optimistic update', async () => {
      // Set initial state
      useProjectStore.setState({
        projects: [
          {
            id: 'project-1',
            name: 'Old Name',
            description: 'Old Description',
            thumbnail: null,
            updatedAt: new Date().toISOString(),
            componentCount: 5,
            userId: 'user-1',
          },
        ],
      });

      const mockUpdatedProject = {
        id: 'project-1',
        name: 'New Name',
        description: 'New Description',
        thumbnail: null,
        updatedAt: new Date().toISOString(),
        componentCount: 5,
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        uiDocument: {
          root: {
            id: 'root',
            type: 'Container' as const,
            props: {},
            styles: { mobile: {} },
            children: [],
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'user' as const,
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
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { project: mockUpdatedProject },
        }),
      });

      const { updateProject } = useProjectStore.getState();
      await updateProject('project-1', { name: 'New Name', description: 'New Description' });

      const state = useProjectStore.getState();
      expect(state.projects[0].name).toBe('New Name');
      expect(state.projects[0].description).toBe('New Description');
    });
  });

  describe('Delete Project', () => {
    it('should delete project with optimistic update', async () => {
      // Set initial state
      useProjectStore.setState({
        projects: [
          {
            id: 'project-1',
            name: 'Project 1',
            description: null,
            thumbnail: null,
            updatedAt: new Date().toISOString(),
            componentCount: 5,
            userId: 'user-1',
          },
          {
            id: 'project-2',
            name: 'Project 2',
            description: null,
            thumbnail: null,
            updatedAt: new Date().toISOString(),
            componentCount: 3,
            userId: 'user-1',
          },
        ],
        currentProjectId: 'project-1',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
        }),
      });

      const { deleteProject } = useProjectStore.getState();
      await deleteProject('project-1');

      const state = useProjectStore.getState();
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0].id).toBe('project-2');
      expect(state.currentProjectId).toBeNull();
    });
  });
});
