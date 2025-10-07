import { useState } from 'react';
import styled from 'styled-components';
import { Clock, GitBranch, GitCommit, User, RotateCcw } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.bgPrimary};
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const BranchSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const BranchButton = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.accentOrange : theme.colors.bgSecondary};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme, $isActive }) =>
    $isActive ? theme.colors.accentOrange : theme.colors.borderColor};
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? '#ff6611' : theme.colors.bgTertiary};
  }
`;

const Timeline = styled.div`
  position: relative;
  padding-left: ${({ theme }) => theme.spacing.xl};
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: ${({ theme }) => theme.colors.borderColor};
`;

const VersionItem = styled.div<{ $isActive: boolean }>`
  position: relative;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.bgTertiary : theme.colors.bgSecondary};
  border: 1px solid ${({ theme, $isActive }) =>
    $isActive ? theme.colors.accentOrange : theme.colors.borderColor};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    border-color: ${({ theme }) => theme.colors.borderActive};
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -${({ theme }) => theme.spacing.xl};
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.accentOrange : theme.colors.bgHover};
    border: 2px solid ${({ theme }) => theme.colors.borderColor};
  }
`;

const VersionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const VersionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const VersionId = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const VersionMessage = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const VersionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $variant }) => 
    $variant === 'primary' ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.primary : theme.colors.borderColor};
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    background: ${({ theme, $variant }) => 
      $variant === 'primary' ? '#0066cc' : theme.colors.bgHover};
    border-color: ${({ theme, $variant }) => 
      $variant === 'primary' ? '#0066cc' : theme.colors.borderActive};
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

interface Version {
  id: string;
  project_id: string;
  branch: string;
  parent_id: string | null;
  message: string;
  author?: string;
  user_id?: string;
  user_name?: string;
  timestamp?: number;
  created_at?: string;
  data_path: string;
}

interface Branch {
  id: string;
  project_id: string;
  name: string;
  head_version_id: string | null;
  created_at: number;
}

interface VersionHistoryProps {
  versions: Version[];
  branches: Branch[];
  currentVersionId?: string;
  onSelectVersion: (versionId: string) => void;
  onRevertToVersion?: (versionId: string) => void;
  onBranchFromVersion?: (versionId: string) => void;
}

function VersionHistory({ 
  versions, 
  branches, 
  currentVersionId, 
  onSelectVersion,
  onRevertToVersion,
  onBranchFromVersion 
}: VersionHistoryProps) {
  const [selectedBranch, setSelectedBranch] = useState('main');
  const { showConfirm, showPrompt } = useModal();

  // 按分支过滤版本
  const filteredVersions = versions
    .filter(v => v.branch === selectedBranch)
    .sort((a, b) => {
      const aTime = a.timestamp || (a.created_at ? new Date(a.created_at).getTime() : 0);
      const bTime = b.timestamp || (b.created_at ? new Date(b.created_at).getTime() : 0);
      return bTime - aTime;
    });

  const formatDate = (timestamp?: number | string) => {
    if (!timestamp) return 'Unknown date';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatTimeAgo = (timestamp?: number | string) => {
    if (!timestamp) return 'Unknown time';
    const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
    if (isNaN(time)) return 'Invalid time';
    const seconds = Math.floor((Date.now() - time) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleRevert = async (e: React.MouseEvent, versionId: string) => {
    e.stopPropagation();
    if (await showConfirm({ message: 'Are you sure you want to revert to this version?', type: 'warning' })) {
      onRevertToVersion?.(versionId);
    }
  };

  const handleBranch = async (e: React.MouseEvent, versionId: string) => {
    e.stopPropagation();
    const branchName = await showPrompt({ message: 'Enter new branch name:', placeholder: 'Branch name' });
    if (branchName) {
      onBranchFromVersion?.(versionId);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Version History</Title>
        <BranchSelector>
          {branches.map((branch) => (
            <BranchButton
              key={branch.id}
              $isActive={selectedBranch === branch.name}
              onClick={() => setSelectedBranch(branch.name)}
            >
              <GitBranch size={14} />
              {branch.name}
            </BranchButton>
          ))}
        </BranchSelector>
      </Header>

      <Timeline>
        <TimelineLine />
        {filteredVersions.map((version) => (
          <VersionItem
            key={version.id}
            $isActive={version.id === currentVersionId}
            onClick={() => onSelectVersion(version.id)}
          >
            <VersionHeader>
              <VersionInfo>
                <GitCommit size={16} />
                <VersionId>{version.id.substring(0, 8)}</VersionId>
              </VersionInfo>
              <ActionButtons>
                <ActionButton 
                  $variant="secondary"
                  onClick={(e) => handleRevert(e, version.id)}
                  title="Revert to this version"
                >
                  <RotateCcw />
                  Revert
                </ActionButton>
                <ActionButton 
                  $variant="secondary"
                  onClick={(e) => handleBranch(e, version.id)}
                  title="Create branch from this version"
                >
                  <GitBranch />
                  Branch
                </ActionButton>
              </ActionButtons>
            </VersionHeader>
            
            <VersionMessage>{version.message}</VersionMessage>
            
            <VersionMeta>
              <MetaItem>
                <User size={12} />
                {version.author}
              </MetaItem>
              <MetaItem>
                <Clock size={12} />
                {formatTimeAgo(version.timestamp || version.created_at)}
              </MetaItem>
              <MetaItem title={formatDate(version.timestamp || version.created_at)}>
                {(() => {
                  const ts = version.timestamp || version.created_at;
                  if (!ts) return 'Unknown date';
                  const date = typeof ts === 'string' ? new Date(ts) : new Date(ts);
                  return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
                })()}
              </MetaItem>
            </VersionMeta>
          </VersionItem>
        ))}
      </Timeline>
    </Container>
  );
}

export default VersionHistory;
