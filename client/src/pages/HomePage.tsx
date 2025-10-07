import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Upload, Folder, Edit2, Trash2, Copy, User, Settings } from 'lucide-react';
import { projectApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import AuthModal from '../components/AuthModal';
import ProjectThumbnailCanvas from '../components/ProjectThumbnail';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const Sidebar = styled.div`
  width: 280px;
  min-width: 280px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const SidebarContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SidebarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const Logo = styled.div`
  font-size: 16px;
  font-weight: 400;
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
`;

const UserSection = styled.div`
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accentOrange}, ${({ theme }) => theme.colors.accentBlue});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: white;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textTertiary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AccountButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.borderActive};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SidebarNav = styled.div`
  flex: 1;
`;

const NavItem = styled.div<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, $active }) => $active ? theme.colors.textPrimary : theme.colors.textSecondary};
  background: ${({ theme, $active }) => $active ? theme.colors.bgTertiary : 'transparent'};
  font-size: 13px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const UploadArea = styled.div<{ $isDragging: boolean }>`
  width: 100%;
  height: 200px;
  border: 1px solid ${({ theme, $isDragging }) => 
    $isDragging ? theme.colors.accentOrange : theme.colors.borderColor};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $isDragging }) => 
    $isDragging 
      ? theme.colors.bgTertiary 
      : `linear-gradient(135deg, ${theme.colors.bgSecondary} 0%, rgba(30, 30, 30, 0.5) 100%)`};
  cursor: pointer;
  transition: border-color 0.3s ease;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  isolation: isolate;
  
  /* Apple Intelligence style animated gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgba(59, 130, 246, 0.15) 60deg,
      rgba(99, 102, 241, 0.2) 120deg,
      rgba(139, 92, 246, 0.15) 180deg,
      transparent 240deg,
      transparent 360deg
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: none;
    z-index: -1;
  }
  
  &:hover::before {
    opacity: 1;
    animation: rotate-gradient 4s linear infinite;
  }
  
  /* Inner glow effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: radial-gradient(
      circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(59, 130, 246, 0.08) 0%,
      rgba(139, 92, 246, 0.05) 30%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: -1;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  @keyframes rotate-gradient {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.borderActive};
  }
`;

const UploadIcon = styled(Upload)`
  width: 48px;
  height: 48px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UploadText = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const ProjectCard = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.borderActive};
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
`;

const ProjectThumbnail = styled.div`
  width: 100%;
  height: 140px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  position: relative;
  overflow: hidden;
`;

const ProjectInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const ProjectTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const ProjectActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
`;

const IconButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xs};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 11px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.borderActive};
  }
  
  &:hover.delete {
    background: ${({ theme }) => theme.colors.error};
    color: white;
    border-color: ${({ theme }) => theme.colors.error};
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const Input = styled.input`
  display: none;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  width: 400px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TextInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bgTertiary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accentOrange};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.accentOrange : theme.colors.bgTertiary};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.accentOrange : theme.colors.borderColor};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme, $variant }) => 
      $variant === 'primary' ? '#ff6611' : theme.colors.bgHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showAlert, showConfirm, showPrompt } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [author, setAuthor] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Update auth modal visibility when authentication status changes
  useEffect(() => {
    setShowAuthModal(!isAuthenticated);
  }, [isAuthenticated]);

  // Set author to current user's username when authenticated
  useEffect(() => {
    if (user) {
      setAuthor(user.username);
    }
  }, [user]);

  // Load projects when user changes (login/logout) or on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    } else {
      setProjects([]); // Clear projects when logged out
    }
  }, [isAuthenticated, user]);

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      await showConfirm({ message: 'Are you sure you want to delete this project?' });
      const userId = user?.id;
      await projectApi.deleteProject(projectId, userId);
      await loadProjects();
      await showAlert({ message: 'Project deleted successfully', type: 'success' });
    } catch (error) {
      // User cancelled or error occurred
      if (error && typeof error === 'object' && 'message' in error) {
        await showAlert({ message: 'Failed to delete project', type: 'error' });
      }
    }
  };

  const handleDuplicateProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      const name = await showPrompt({ message: 'Enter a name for the duplicated project:' });
      if (!name) return;
      
      const userId = user?.id;
      await projectApi.duplicateProject(projectId, name, userId);
      await loadProjects();
      await showAlert({ message: 'Project duplicated successfully', type: 'success' });
    } catch (error) {
      await showAlert({ message: 'Failed to duplicate project', type: 'error' });
    }
  };

  const handleRenameProject = async (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleSaveRename = async (projectId: string) => {
    if (!editingName.trim()) return;
    
    try {
      await projectApi.renameProject(projectId, editingName);
      setEditingProjectId(null);
      setEditingName('');
      await loadProjects();
    } catch (error) {
      await showAlert({ message: 'Failed to rename project', type: 'error' });
    }
  };

  const handleCancelRename = () => {
    setEditingProjectId(null);
    setEditingName('');
  };

  const loadProjects = async () => {
    try {
      // Use user ID to fetch projects
      const userId = user?.id;
      const data = await projectApi.getProjects(userId);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.als')) {
      setSelectedFile(files[0]);
      // Auto-fill author with logged-in username
      if (user) {
        setAuthor(user.username);
      }
      setShowModal(true);
    } else {
      await showAlert({ message: 'Please upload a valid .als file', type: 'warning' });
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].name.endsWith('.als')) {
        setSelectedFile(files[0]);
        // Auto-fill author with logged-in username
        if (user) {
          setAuthor(user.username);
        }
        setShowModal(true);
      } else {
        await showAlert({ message: 'Please upload a valid .als file', type: 'warning' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !projectName || !author) return;
    
    // Check authentication first
    if (!isAuthenticated || !user) {
      await showAlert({ 
        message: 'Please log in to create a project.', 
        type: 'error' 
      });
      setShowModal(false);
      setShowAuthModal(true);
      return;
    }
    
    setIsUploading(true);
    try {
      // Use user ID for authentication
      const userId = user.id;
      console.log('Initializing project with:', { projectName, author, fileName: selectedFile.name, userId });
      
      const result = await projectApi.initProject(
        selectedFile, 
        projectName, 
        author, 
        userId // Pass user ID
      );
      console.log('Project initialized successfully:', result);
      
      // Close modal and clear state first
      setShowModal(false);
      setSelectedFile(null);
      setProjectName('');
      
      // Reload projects in background
      loadProjects().catch(console.error);
      
      // Navigate immediately without waiting for alert
      navigate(`/project/${result.projectId}`);
      
    } catch (error: any) {
      console.error('Error initializing project:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error occurred';
      await showAlert({ message: `Failed to initialize project: ${errorMsg}\n\nPlease check that the backend server is running on port 3001.`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFile(null);
    setProjectName('');
    setAuthor('');
  };

  return (
    <Container>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarContent>
          {user && (
            <>
              <UserSection>
                <UserProfile>
                  <UserAvatar>
                    {user.username.charAt(0).toUpperCase()}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{user.username}</UserName>
                    <UserEmail>{user.email || 'user@coldaw.com'}</UserEmail>
                  </UserDetails>
                </UserProfile>
                
                <AccountButton onClick={() => navigate('/account')}>
                  <User size={16} />
                  Account
                </AccountButton>
              </UserSection>
              
              <SidebarNav>
                <NavItem $active>
                  <Folder size={16} />
                  Projects
                </NavItem>
                <NavItem>
                  <Settings size={16} />
                  Settings
                </NavItem>
              </SidebarNav>
            </>
          )}
        </SidebarContent>
        
        <SidebarFooter>
          <Logo>ColDAW</Logo>
        </SidebarFooter>
      </Sidebar>
      
      {/* Main Content */}
      <MainContent>
        <Content>
          {/* Upload Area */}
          <UploadArea
            $isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <UploadIcon />
            <UploadText>Create New Project</UploadText>
            <UploadHint>Drop your .als file here or click to browse</UploadHint>
          </UploadArea>
          
          {/* Projects Grid */}
          {projects.length > 0 && (
            <ProjectsGrid>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <ProjectThumbnail>
                    <ProjectThumbnailCanvas 
                      projectId={project.id} 
                      projectName={project.name}
                    />
                  </ProjectThumbnail>
                  
                  <ProjectInfo>
                    {editingProjectId === project.id ? (
                      <TextInput
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveRename(project.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(project.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <>
                        <ProjectTitle>{project.name}</ProjectTitle>
                        <ProjectMeta>
                          <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                        </ProjectMeta>
                      </>
                    )}
                  </ProjectInfo>
                  
                  <ProjectActions onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      onClick={(e) => handleRenameProject(e, project)}
                      title="Rename"
                    >
                      <Edit2 size={14} />
                    </IconButton>
                    <IconButton
                      onClick={(e) => handleDuplicateProject(e, project.id)}
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </IconButton>
                    <IconButton
                      className="delete"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </ProjectActions>
                </ProjectCard>
              ))}
            </ProjectsGrid>
          )}
        </Content>
      </MainContent>

      <Input
        ref={fileInputRef}
        type="file"
        accept=".als"
        onChange={handleFileChange}
      />

      {showModal && (
        <Modal onClick={handleCancel}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Initialize Project</ModalTitle>
            
            <Label>Project Name</Label>
            <TextInput
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Track"
            />
            
            <Label>Your Name</Label>
            <TextInput
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Artist Name"
            />
            
            <Label>File</Label>
            <TextInput
              type="text"
              value={selectedFile?.name || ''}
              disabled
            />
            
            <ButtonGroup>
              <Button $variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                $variant="primary"
                onClick={handleSubmit}
                disabled={!projectName || !author || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Create Project'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default HomePage;
