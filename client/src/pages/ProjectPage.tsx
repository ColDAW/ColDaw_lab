import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useStore } from '../store/useStore';
import { projectApi, versionApi } from '../api/api';
import MenuBar from '../components/MenuBar';
import ArrangementView from '../components/ArrangementView';
import Timeline from '../components/Timeline';
import VersionHistory from '../components/VersionHistory';
import CollaboratorCursors from '../components/CollaboratorCursors';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgPrimary};
  overflow: hidden;
`;

const Workspace = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const Loading = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { showAlert, showConfirm, showPrompt } = useModal();
  const {
    currentProject,
    projectData,
    setCurrentProject,
    setProjectData,
    setBranches,
    setVersions,
    initSocket,
    disconnectSocket,
  } = useStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Redirect to home if not logged in after auth has loaded
    if (!user) {
      showAlert({ message: 'Please login to view projects', type: 'warning' });
      navigate('/');
      return;
    }

    loadProject();
    
    // Use logged-in username
    const userName = user.username;
    useStore.getState().setCurrentUser(userName);
    
    // Initialize WebSocket connection
    initSocket(projectId, userName);

    return () => {
      disconnectSocket();
    };
  }, [projectId, user, authLoading, navigate]);

  const loadProject = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      console.log('Loading project:', projectId);
      
      // Load project details
      const projectDetails = await projectApi.getProject(projectId);
      console.log('Project details loaded:', projectDetails);
      
      setCurrentProject(projectDetails.project);
      setBranches(projectDetails.branches);
      setVersions(projectDetails.versions);
      
      // Load latest version data
      if (projectDetails.versions.length > 0) {
        const latestVersion = projectDetails.versions[0];
        console.log('Loading version:', latestVersion.id);
        setSelectedVersionId(latestVersion.id);
        
        const versionData = await projectApi.getVersion(projectId, latestVersion.id);
        console.log('Version data loaded:', versionData);
        
        setProjectData(versionData.data);
      } else {
        console.warn('No versions found for project');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      await showAlert({ message: 'Failed to load project: ' + (error as Error).message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVersion = async (versionId: string) => {
    if (!projectId) return;
    
    try {
      setSelectedVersionId(versionId);
      const versionData = await projectApi.getVersion(projectId, versionId);
      setProjectData(versionData.data);
      // Switch to arrangement view after selecting version
      setShowVersionHistory(false);
    } catch (error) {
      console.error('Error loading version:', error);
      await showAlert({ message: 'Failed to load version', type: 'error' });
    }
  };

  const handleRevertToVersion = async (versionId: string) => {
    if (!projectId || !user || !currentProject) return;
    
    if (!await showConfirm({ message: 'Are you sure you want to revert to this version? This will create a new commit with the content from the selected version.', type: 'warning' })) {
      return;
    }
    
    const message = await showPrompt({ message: 'Revert commit message:', defaultValue: `Revert to version ${versionId.substring(0, 8)}` });
    if (!message) return;
    
    try {
      setIsLoading(true);
      
      // Call the revert API
      await versionApi.revertToVersion(
        projectId,
        versionId,
        currentProject.current_branch,
        message,
        user.username
      );
      
      await showAlert({ message: 'Reverted successfully!', type: 'success' });
      
      // Reload project data
      await loadProject();
      
      // Switch back to arrangement view
      setShowVersionHistory(false);
    } catch (error) {
      console.error('Error reverting to version:', error);
      await showAlert({ message: 'Failed to revert to version: ' + (error as Error).message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchFromVersion = async (versionId: string) => {
    // TODO: Implement branch creation from specific version
    console.log('Will branch from version:', versionId);
    await showAlert({ message: 'Branch from version functionality will be implemented soon', type: 'info' });
  };

  const handleVersionCommitted = async () => {
    // Reload project data after commit without full page reload
    await loadProject();
  };

  if (authLoading || isLoading) {
    return (
      <Container>
        <Loading>Loading project...</Loading>
      </Container>
    );
  }

  if (!currentProject || !projectData) {
    return (
      <Container>
        <Loading>Project not found</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <MenuBar 
        onToggleHistory={() => setShowVersionHistory(!showVersionHistory)}
        showingHistory={showVersionHistory}
        onVersionCommitted={handleVersionCommitted}
        currentVersionId={selectedVersionId || undefined}
      />
      <Workspace>
        {showVersionHistory ? (
          <VersionHistory
            versions={useStore.getState().versions}
            branches={useStore.getState().branches}
            currentVersionId={selectedVersionId || undefined}
            onSelectVersion={handleSelectVersion}
            onRevertToVersion={handleRevertToVersion}
            onBranchFromVersion={handleBranchFromVersion}
          />
        ) : (
          <>
            <Timeline />
            <ArrangementView tracks={projectData.tracks} tempo={projectData.tempo} />
            <CollaboratorCursors />
          </>
        )}
      </Workspace>
    </Container>
  );
}

export default ProjectPage;
