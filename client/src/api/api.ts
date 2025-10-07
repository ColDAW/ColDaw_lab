import axios from 'axios';

// In production (Railway), frontend and backend are served from the same domain
// So we can use an empty string to use relative paths
// In development, use localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor: automatically add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('coldaw_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the full URL for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle errors uniformly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid, clear local storage
      localStorage.removeItem('coldaw_token');
      // Redirect to home page if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Login
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  // Register
  async register(email: string, password: string, name: string) {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      name 
    });
    return response.data;
  },
  
  // Verify token
  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  },
  
  // Logout
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

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

  // Get pending changes for a project
  async getPendingChanges(projectId: string) {
    const response = await api.get(`/projects/${projectId}/pending-changes`);
    return response.data;
  },

  // Get VST import data
  async getVSTImport(projectId: string) {
    const response = await api.get(`/projects/${projectId}/vst-import`);
    return response.data;
  },

  // Push (commit) a pending change
  async pushPendingChange(projectId: string, pendingId: string) {
    const response = await api.post(`/projects/${projectId}/push-pending/${pendingId}`);
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
  
  // Commit from VST import (temp file already on server)
  async commitVSTImport(projectId: string, tempFileName: string, branch: string, message: string, author: string) {
    const formData = new FormData();
    formData.append('branch', branch);
    formData.append('message', message);
    formData.append('author', author);
    formData.append('fromVST', 'true');
    formData.append('tempFileName', tempFileName);
    
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
