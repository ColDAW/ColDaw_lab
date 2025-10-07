import styled from 'styled-components';
import { useStore } from '../store/useStore';
import { Clock, GitCommit, ZoomIn } from 'lucide-react';

interface TimelineProps {
  onPush?: () => void;
  isPushing?: boolean;
  hasChanges?: boolean;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

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

const PushButton = styled.button<{ $hasChanges?: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $hasChanges }) => $hasChanges ? theme.colors.accentOrange : 'transparent'};
  color: ${({ theme, $hasChanges }) => $hasChanges ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${({ theme, $hasChanges }) => $hasChanges ? theme.colors.accentOrange : theme.colors.borderColor};
  border-radius: 6px;
  font-size: 13px;
  font-weight: ${({ $hasChanges }) => $hasChanges ? '600' : '400'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: ${({ theme }) => theme.spacing.md};
  
  &:hover {
    background: ${({ theme, $hasChanges }) => $hasChanges ? theme.colors.accentBlue : theme.colors.bgTertiary};
    color: white;
    border-color: ${({ theme, $hasChanges }) => $hasChanges ? theme.colors.accentBlue : theme.colors.borderActive};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ZoomControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-left: auto;
  padding-right: ${({ theme }) => theme.spacing.lg};
`;

const ZoomLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ZoomSlider = styled.input`
  width: 120px;
  height: 4px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 16px;
    border-radius: 3px;
    background: ${({ theme }) => theme.colors.textTertiary};
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${({ theme }) => theme.colors.accentBlue};
      transform: scaleY(1.1);
    }
  }
  
  &::-moz-range-thumb {
    width: 10px;
    height: 16px;
    border-radius: 3px;
    background: ${({ theme }) => theme.colors.textTertiary};
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${({ theme }) => theme.colors.accentBlue};
      transform: scaleY(1.1);
    }
  }
`;

const ZoomValue = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-family: ${({ theme }) => theme.fonts.mono};
  min-width: 40px;
  text-align: right;
`;

function Timeline({ onPush, isPushing, hasChanges, zoom = 1, onZoomChange }: TimelineProps) {
  const { projectData, versions, hasPendingChanges, pendingData } = useStore();

  if (!projectData && !pendingData) return null;

  // Get the latest version (first in the array)
  const currentVersion = versions[0];
  
  // Debug logging
  console.log('[Timeline] Current version:', currentVersion);
  console.log('[Timeline] All versions:', versions);
  
  // Use pending data if available for display
  const displayData = hasPendingChanges && pendingData ? pendingData : projectData;

  const formatDate = (timestamp: number | string) => {
    if (!timestamp) {
      console.warn('[Timeline] No timestamp provided');
      return 'Unknown date';
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.warn('[Timeline] Invalid timestamp:', timestamp);
      return 'Invalid date';
    }
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
              {hasPendingChanges ? 'Imported changes (not pushed)' : (currentVersion?.message || 'No message')}
            </VersionMessage>
            {currentVersion && !hasPendingChanges && (
              <>
                <VersionMeta>
                  <Clock size={12} />
                  {formatDate(currentVersion.timestamp || currentVersion.created_at || 0)}
                </VersionMeta>
                <VersionMeta>
                  by {currentVersion.author || currentVersion.user_name || currentVersion.user_id || 'Unknown'}
                </VersionMeta>
              </>
            )}
          </VersionInfo>
        </>
      )}
      
      {onPush && (
        <PushButton 
          onClick={onPush} 
          disabled={isPushing || !hasChanges}
          $hasChanges={hasChanges}
        >
          <GitCommit />
          {isPushing ? 'Pushing...' : 'Push'}
        </PushButton>
      )}
      
      {onZoomChange && (
        <ZoomControl>
          <ZoomLabel>
            <ZoomIn size={14} />
            Zoom
          </ZoomLabel>
          <ZoomSlider
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          />
          <ZoomValue>{(zoom * 100).toFixed(0)}%</ZoomValue>
        </ZoomControl>
      )}
    </Container>
  );
}

export default Timeline;
