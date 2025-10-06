import styled from 'styled-components';
import { Volume2 } from 'lucide-react';

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const Track = styled.div<{ $isSelected: boolean }>`
  height: ${({ theme }) => theme.sizes.trackHeight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.bgTertiary : theme.colors.bgSecondary};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
  }
`;

const TrackInfo = styled.div`
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TrackName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TrackType = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textTertiary};
  letter-spacing: 0.5px;
`;

const TrackControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-left: auto;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.bgHover};
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accentOrange};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accentOrange};
    cursor: pointer;
    border: none;
  }
`;

const VolumeValue = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 40px;
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const MuteButton = styled.button<{ $isMuted: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $isMuted }) =>
    $isMuted ? theme.colors.accentRed : 'transparent'};
  color: ${({ theme, $isMuted }) =>
    $isMuted ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${({ theme, $isMuted }) =>
    $isMuted ? theme.colors.accentRed : theme.colors.borderColor};
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentRed};
    color: white;
  }
`;

const SoloButton = styled.button<{ $isSolo: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $isSolo }) =>
    $isSolo ? theme.colors.accentYellow : 'transparent'};
  color: ${({ theme, $isSolo }) =>
    $isSolo ? theme.colors.bgPrimary : theme.colors.textSecondary};
  border: 1px solid ${({ theme, $isSolo }) =>
    $isSolo ? theme.colors.accentYellow : theme.colors.borderColor};
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentYellow};
    color: ${({ theme }) => theme.colors.bgPrimary};
  }
`;

const ColorIndicator = styled.div<{ color: number }>`
  width: 4px;
  height: 40px;
  background: ${({ color }) => `hsl(${(color * 360) / 69}, 70%, 60%)`};
  border-radius: 2px;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'return' | 'master';
  color: number;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  clips: any[];
  devices: any[];
}

interface TrackListProps {
  tracks: Track[];
}

function TrackList({ tracks }: TrackListProps) {
  const formatVolume = (volume: number) => {
    // Convert 0-1 to dB scale (simplified)
    if (volume === 0) return '-∞ dB';
    const db = 20 * Math.log10(volume);
    return `${db.toFixed(1)} dB`;
  };

  return (
    <Container>
      {tracks.map((track, index) => (
        <Track key={`${track.type}-${track.id || index}`} $isSelected={false}>
          <ColorIndicator color={track.color} />
          <TrackInfo>
            <TrackName>{track.name}</TrackName>
            <TrackType>{track.type}</TrackType>
          </TrackInfo>
          <TrackControls>
            <MuteButton $isMuted={track.isMuted}>M</MuteButton>
            <SoloButton $isSolo={track.isSolo}>S</SoloButton>
            <VolumeControl>
              <Volume2 size={14} />
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={track.volume}
                readOnly
              />
              <VolumeValue>{formatVolume(track.volume)}</VolumeValue>
            </VolumeControl>
          </TrackControls>
        </Track>
      ))}
    </Container>
  );
}

export default TrackList;
