import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectApi = {
  // Parse ALS file without creating a version (for preview)
  async parseALSFile(file: File) {
    const formData = new FormData();
    formData.append('alsFile', file);
    
    const response = await api.post('/projects/parse-als', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Initialize a new project
  async initProject(file: File, projectName: string, author: string, userId?: string) {
    const formData = new FormData();
    formData.append('alsFile', file);
    formData.append('projectName', projectName);
    formData.append('author', author);
    if (userId) {
      formData.append('userId', userId);
    }
    
    const response = await api.post('/projects/init', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Get all projects (optionally filtered by userId)
  async getProjects(userId?: string) {
    const params = userId ? { userId } : {};
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  // Get project details
  async getProject(projectId: string) {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
  
  // Get specific version data
  async getVersion(projectId: string, versionId: string) {
    const response = await api.get(`/projects/${projectId}/version/${versionId}`);
    return response.data;
  },
  
  // Rename project
  async renameProject(projectId: string, name: string, userId?: string) {
    const response = await api.patch(`/projects/${projectId}`, {
      name,
      userId,
    });
    return response.data;
  },
  
  // Duplicate project
  async duplicateProject(projectId: string, name: string, userId?: string) {
    const response = await api.post(`/projects/${projectId}/duplicate`, {
      name,
      userId,
    });
    return response.data;
  },
  
  // Delete project
  async deleteProject(projectId: string, userId?: string) {
    const params = userId ? { userId } : {};
    const response = await api.delete(`/projects/${projectId}`, { params });
    return response.data;
  },

  // Invite collaborator
  async inviteCollaborator(projectId: string, email: string, invitedBy: string) {
    const response = await api.post(`/projects/${projectId}/invite`, {
      email,
      invitedBy,
    });
    return response.data;
  },
};

export const versionApi = {
  // Commit a new version
  async commitVersion(projectId: string, file: File, branch: string, message: string, author: string) {
    const formData = new FormData();
    formData.append('alsFile', file);
    formData.append('branch', branch);
    formData.append('message', message);
    formData.append('author', author);
    
    const response = await api.post(`/versions/${projectId}/commit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Create a new branch
  async createBranch(projectId: string, name: string, fromBranch?: string, fromVersionId?: string) {
    const response = await api.post(`/versions/${projectId}/branch`, {
      name,
      fromBranch,
      fromVersionId,
    });
    return response.data;
  },
  
  // Merge branches
  async mergeBranches(projectId: string, sourceBranch: string, targetBranch: string, author: string) {
    const response = await api.post(`/versions/${projectId}/merge`, {
      sourceBranch,
      targetBranch,
      author,
    });
    return response.data;
  },
  
  // Get version history
  async getHistory(projectId: string, branch?: string) {
    const params = branch ? { branch } : {};
    const response = await api.get(`/versions/${projectId}/history`, { params });
    return response.data;
  },
  
  // Get branches
  async getBranches(projectId: string) {
    const response = await api.get(`/versions/${projectId}/branches`);
    return response.data;
  },

  // Download version data
  async downloadVersion(projectId: string, versionId: string) {
    const response = await api.get(`/versions/${projectId}/download/${versionId}`, {
      responseType: 'blob',
    });
    return response;
  },

  // Revert to a specific version
  async revertToVersion(projectId: string, versionId: string, branch: string, message: string, author: string) {
    const response = await api.post(`/versions/${projectId}/revert/${versionId}`, {
      branch,
      message,
      author,
    });
    return response.data;
  },
};

export default api;
