import styled from 'styled-components';
import { useStore } from '../store/useStore';
import { Clock, GitCommit } from 'lucide-react';

const Container = styled.div`
  height: 60px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.xl};
`;

const InfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Tempo = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const TimeSignature = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.mono};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const Separator = styled.div`
  width: 1px;
  height: 30px;
  background: ${({ theme }) => theme.colors.borderColor};
`;

const VersionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const VersionMessage = styled.div<{ $isPending?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme, $isPending }) => $isPending ? theme.colors.textTertiary : theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  
  svg {
    color: ${({ theme, $isPending }) => $isPending ? theme.colors.textTertiary : theme.colors.textPrimary};
  }
`;

const VersionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 12px;
`;

function Timeline() {
  const { projectData, versions, hasPendingChanges, pendingData } = useStore();

  if (!projectData && !pendingData) return null;

  // Get the latest version (first in the array)
  const currentVersion = versions[0];
  
  // Use pending data if available for display
  const displayData = hasPendingChanges && pendingData ? pendingData : projectData;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container>
      <InfoGroup>
        <Tempo>{displayData!.tempo.toFixed(1)} BPM</Tempo>
        <TimeSignature>
          {displayData!.timeSignatureNumerator}/{displayData!.timeSignatureDenominator}
        </TimeSignature>
      </InfoGroup>
      
      {(currentVersion || hasPendingChanges) && (
        <>
          <Separator />
          <VersionInfo>
            <VersionMessage $isPending={hasPendingChanges}>
              <GitCommit size={14} />
              {hasPendingChanges ? 'Imported changes (not pushed)' : currentVersion?.message}
            </VersionMessage>
            {currentVersion && !hasPendingChanges && (
              <>
                <VersionMeta>
                  <Clock size={12} />
                  {formatDate(currentVersion.timestamp)}
                </VersionMeta>
                <VersionMeta>
                  by {currentVersion.author}
                </VersionMeta>
              </>
            )}
          </VersionInfo>
        </>
      )}
    </Container>
  );
}

export default Timeline;
