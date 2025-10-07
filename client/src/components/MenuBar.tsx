import { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Download,
  GitBranch,
  Clock,
  Users,
  ArrowLeft,
  LogOut,
  User,
  UserPlus,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { projectApi, versionApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

interface MenuBarProps {
  onToggleHistory?: () => void;
  showingHistory?: boolean;
  onVersionCommitted?: () => void;
  currentVersionId?: string;
  onFileImported?: (file: File) => void;
}

const Container = styled.div`
  height: ${({ theme }) => theme.sizes.headerHeight};
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};
`;

const Logo = styled.div`
  font-size: 15px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.accentOrange};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
`;

const ProjectName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-left: ${({ theme }) => theme.spacing.md};
`;

const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.borderColor};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: auto;
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.borderActive};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CollaboratorsList = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.md};
`;

const CollaboratorAvatar = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: 6px;
  margin-left: ${({ theme }) => theme.spacing.md};
`;

const UserName = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const LogoutButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: white;
    border-color: ${({ theme }) => theme.colors.error};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const InviteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentOrange};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentBlue};
    transform: scale(1.05);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

function MenuBar({ onToggleHistory, onVersionCommitted, currentVersionId, onFileImported }: MenuBarProps = {}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showAlert, showConfirm, showPrompt } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentProject, collaborators, setPendingData } = useStore();
  const [isImporting, setIsImporting] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handleInvite = async () => {
    if (!currentProject || !user) return;
    
    const email = await showPrompt({
      message: 'Enter the email address of the person you want to invite:',
      placeholder: 'email@example.com',
      title: 'Invite Collaborator',
    });
    
    if (!email) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await showAlert({
        message: 'Please enter a valid email address.',
        type: 'error',
      });
      return;
    }
    
    try {
      await projectApi.inviteCollaborator(currentProject.id, email, user.username);
      await showAlert({
        message: `Successfully invited ${email} to collaborate on this project!`,
        type: 'success',
      });
    } catch (error: any) {
      await showAlert({
        message: error.response?.data?.error || 'Failed to invite collaborator',
        type: 'error',
      });
    }
  };

  const handleLogout = async () => {
    if (await showConfirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  // Import: Load file into editor without committing to version system
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.als')) {
      await showAlert({ message: 'Please upload a valid .als file', type: 'warning' });
      return;
    }
    
    if (!user) {
      await showAlert({ message: 'Please login to import files', type: 'warning' });
      return;
    }
    
    setIsImporting(true);
    try {
      // Parse the ALS file to get the data
      const result = await projectApi.parseALSFile(file);
      
      // Store the parsed data as pending changes
      setPendingData(result.data);
      
      // Store the file for later push - call parent callback
      if (onFileImported) {
        onFileImported(file);
      }
      
      await showAlert({ message: `File "${file.name}" imported successfully! Click Push to commit to version system.`, type: 'success' });
    } catch (error) {
      console.error('Error importing file:', error);
      await showAlert({ message: 'Failed to import file: ' + (error as Error).message, type: 'error' });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async () => {
    if (!currentProject || !currentVersionId) {
      await showAlert({ message: 'No version selected to download', type: 'warning' });
      return;
    }
    
    try {
      const response = await versionApi.downloadVersion(currentProject.id, currentVersionId);
      
      // Get content type from response headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      
      // Create blob from response with correct content type
      const blob = new Blob([response.data], { type: contentType });
      
      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${currentProject.name}-${currentVersionId.substring(0, 8)}.als`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Download completed:', filename);
    } catch (error) {
      console.error('Error downloading version:', error);
      await showAlert({ message: 'Failed to download version', type: 'error' });
    }
  };

  const handleBranch = async () => {
    if (!currentProject) return;
    
    const branchName = await showPrompt({ message: 'New branch name:', placeholder: 'Branch name' });
    if (!branchName) return;
    
    try {
      // Create branch from current version if available
      await versionApi.createBranch(
        currentProject.id, 
        branchName, 
        currentProject.current_branch,
        currentVersionId // This will include all history up to this version
      );
      await showAlert({ message: `Branch '${branchName}' created successfully from current version!`, type: 'success' });
      // Reload to show new branch
      if (onVersionCommitted) {
        onVersionCommitted();
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      await showAlert({ message: 'Failed to create branch', type: 'error' });
    }
  };

  const handleHistory = async () => {
    if (onToggleHistory) {
      onToggleHistory();
    } else {
      await showAlert({ message: 'Version history feature coming soon!', type: 'info' });
    }
  };

  return (
    <Container>
      <Logo onClick={handleBack}>
        <ArrowLeft size={18} />
        ColDAW
      </Logo>
      
      <Separator />
      
      {currentProject && (
        <ProjectName>{currentProject.name}</ProjectName>
      )}
      
      <ButtonGroup>
        <Button onClick={handleImport} disabled={isImporting}>
          <Upload />
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
        <Button onClick={handleDownload}>
          <Download />
          Download
        </Button>
        <Button onClick={handleBranch}>
          <GitBranch />
          Branch
        </Button>
        <Button onClick={handleHistory}>
          <Clock />
          History
        </Button>
      </ButtonGroup>
      
      <Separator />
      
      {collaborators.length > 0 && (
        <CollaboratorsList>
          <Users size={16} />
          {collaborators.map((collab) => (
            <CollaboratorAvatar key={collab.id} color={collab.color} title={collab.userName || 'Unknown'}>
              {(collab.userName || 'U').charAt(0).toUpperCase()}
            </CollaboratorAvatar>
          ))}
        </CollaboratorsList>
      )}
      
      {user && (
        <>
          <InviteButton onClick={handleInvite} title="Invite Collaborator">
            <UserPlus />
          </InviteButton>
          
          <Separator />
          <UserInfo>
            <User size={16} />
            <UserName>{user.username}</UserName>
            <LogoutButton onClick={handleLogout}>
              <LogOut />
              Logout
            </LogoutButton>
          </UserInfo>
        </>
      )}
      
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept=".als"
        onChange={handleFileChange}
      />
    </Container>
  );
}

export default MenuBar;
