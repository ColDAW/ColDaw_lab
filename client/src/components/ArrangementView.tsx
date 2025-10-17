import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useStore } from '../store/useStore';

// 渐变调色板 - 每个轨道按顺序使用一种颜色
const TRACK_COLORS = [
  '#C9A511',
  '#53A21F', 
  '#1CA231',
  '#1CA26C',
  '#1CA2A2',
  '#297DA5',
  '#3C5BAD',
  '#553FAD',
  '#7932A9',
  '#881BA3',
  '#A51AA3',
  '#A31C86',
  '#A31CA3',
  '#891BA3'
];

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgPrimary};
  overflow: hidden;
  position: relative;
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bgSecondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderColor};
    border-radius: 6px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.textTertiary};
    }
  }
`;

const TracksContainer = styled.div<{ $width: number }>`
  position: relative;
  width: ${({ $width }) => $width}px;
  min-width: 100%;
`;

const TrackRow = styled.div`
  height: ${({ theme }) => theme.sizes.trackHeight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  position: relative;
`;

const TrackLabel = styled.div`
  width: 200px;
  min-width: 200px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.borderColor};
  position: sticky;
  left: 0;
  z-index: 2;
`;

const TrackName = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.mono};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const ClipLane = styled.div`
  flex: 1;
  position: relative;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const ClipBox = styled.div<{ 
  $left: number; 
  $width: number; 
  $trackIndex: number;
  $isLooping: boolean;
  $diffType?: 'added' | 'removed' | 'modified' | null;
}>`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: 8px;
  width: ${({ $width }) => $width}px;
  height: calc(100% - 16px);
  background: ${({ $trackIndex, $diffType }) => {
    const color = TRACK_COLORS[$trackIndex % TRACK_COLORS.length];
    if ($diffType === 'removed') {
      return `linear-gradient(135deg, ${color}33 0%, ${color}20 100%)`; // 20% opacity for removed clips
    }
    return `linear-gradient(135deg, ${color}E6 0%, ${color}CC 100%)`; // 90% to 80% opacity gradient
  }};
  opacity: ${({ $diffType }) => $diffType === 'removed' ? 0.4 : 1};
  border: 1px solid ${({ $trackIndex, $diffType }) => {
    const baseColor = TRACK_COLORS[$trackIndex % TRACK_COLORS.length];
    if ($diffType === 'added') return '#22c55e';
    if ($diffType === 'removed') return '#ef4444';
    if ($diffType === 'modified') return '#f97316';
    return `${baseColor}60`; // 40% opacity for subtle border
  }};
  border-width: ${({ $diffType }) => $diffType ? '2px' : '1px'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24),
    0 0 0 1px ${({ $trackIndex }) => {
      const color = TRACK_COLORS[$trackIndex % TRACK_COLORS.length];
      return `${color}30`; // 19% opacity for very subtle glow
    }};
  
  ${({ $isLooping }) => $isLooping && `
    border-style: dashed;
  `}
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.2),
      0 2px 6px rgba(0, 0, 0, 0.15),
      0 0 0 2px ${({ $trackIndex }) => {
        const color = TRACK_COLORS[$trackIndex % TRACK_COLORS.length];
        return `${color}50`; // 31% opacity for stronger glow on hover
      }};
    filter: brightness(1.1);
    z-index: 10;
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
    transition: all 0.1s ease;
  }
`;

const ClipName = styled.div`
  padding: 6px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  letter-spacing: -0.2px;
  line-height: 1.2;
  position: relative;
  z-index: 2;
`;

const DiffBadge = styled.div<{ $type: 'added' | 'removed' | 'modified' }>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ $type }) => {
    if ($type === 'added') return '#22c55e';
    if ($type === 'removed') return '#ef4444';
    return '#f97316';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 10;
  
  &::before {
    content: '${({ $type }) => {
      if ($type === 'added') return '+';
      if ($type === 'removed') return '-';
      return '*';
    }}';
  }
`;

const TimeRuler = styled.div`
  height: 32px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  position: relative;
  overflow: hidden;
`;

const RulerLabel = styled.div`
  width: 200px;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.borderColor};
  position: sticky;
  left: 0;
  z-index: 4;
`;

const RulerScrollContainer = styled.div`
  flex: 1;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
`;

const RulerMarks = styled.div<{ $width: number }>`
  position: relative;
  width: ${({ $width }) => $width}px;
  height: 100%;
`;

const BeatMark = styled.div<{ $position: number }>`
  position: absolute;
  left: ${({ $position }) => $position}px;
  top: 0;
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.colors.borderColor};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textTertiary};
  padding: 2px 4px;
  font-family: ${({ theme }) => theme.fonts.mono};
`;

interface Clip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  loopStart: number;
  loopEnd: number;
  isLooping: boolean;
  color: number;
  samplePath?: string;
}

interface Track {
  id: string;
  name: string;
  clips: Clip[];
}

interface ArrangementViewProps {
  tracks: Track[];
  tempo?: number;
  zoom?: number;
}

function ArrangementView({ tracks, zoom = 1 }: ArrangementViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeRulerRef = useRef<HTMLDivElement>(null);
  const { pendingData, hasPendingChanges } = useStore();
  const pixelsPerBeat = 20 * zoom; // Apply zoom to base pixels per beat
  const [maxBeat, setMaxBeat] = useState(128);
  
  // 计算clip的diff类型
  type DiffType = 'added' | 'removed' | 'modified' | null;
  
  interface ClipWithDiff extends Clip {
    diffType: DiffType;
  }
  
  interface TrackWithDiff extends Track {
    allClips: ClipWithDiff[];
  }
  
  const calculateDiff = (): TrackWithDiff[] => {
    if (!hasPendingChanges || !pendingData) {
      // 没有pending changes，正常显示
      return tracks.map(track => ({
        ...track,
        allClips: track.clips.map(clip => ({ ...clip, diffType: null as DiffType }))
      }));
    }
    
    // 有pending changes，计算diff
    const result: TrackWithDiff[] = [];
    
    // 遍历所有track（原始的和pending的）
    const allTrackIds = new Set([
      ...tracks.map(t => t.id),
      ...pendingData.tracks.map(t => t.id)
    ]);
    
    allTrackIds.forEach(trackId => {
      const originalTrack = tracks.find(t => t.id === trackId);
      const pendingTrack = pendingData.tracks.find(t => t.id === trackId);
      
      if (!originalTrack && pendingTrack) {
        // 新track，所有clips都是added
        result.push({
          ...pendingTrack,
          allClips: pendingTrack.clips.map(clip => ({ ...clip, diffType: 'added' as DiffType }))
        });
      } else if (originalTrack && !pendingTrack) {
        // Track被删除，所有clips都是removed
        result.push({
          ...originalTrack,
          allClips: originalTrack.clips.map(clip => ({ ...clip, diffType: 'removed' as DiffType }))
        });
      } else if (originalTrack && pendingTrack) {
        // Track存在于两边，比较clips
        const allClips: ClipWithDiff[] = [];
        
        // 检查原始clips（removed或unchanged）
        originalTrack.clips.forEach(originalClip => {
          const pendingClip = pendingTrack.clips.find(pc => pc.id === originalClip.id);
          
          if (!pendingClip) {
            // Clip被删除
            allClips.push({ ...originalClip, diffType: 'removed' });
          } else {
            // 检查是否被修改
            const isModified = 
              pendingClip.startTime !== originalClip.startTime ||
              pendingClip.endTime !== originalClip.endTime ||
              pendingClip.name !== originalClip.name ||
              pendingClip.color !== originalClip.color;
            
            if (isModified) {
              // 显示原始版本（透明）和修改后的版本
              allClips.push({ ...originalClip, diffType: 'removed' });
              allClips.push({ ...pendingClip, diffType: 'modified' });
            } else {
              // 未修改
              allClips.push({ ...pendingClip, diffType: null });
            }
          }
        });
        
        // 检查新增的clips
        pendingTrack.clips.forEach(pendingClip => {
          const originalClip = originalTrack.clips.find(oc => oc.id === pendingClip.id);
          if (!originalClip) {
            // 新增的clip
            allClips.push({ ...pendingClip, diffType: 'added' });
          }
        });
        
        result.push({
          ...pendingTrack,
          allClips
        });
      }
    });
    
    return result;
  };
  
  const displayTracksWithDiff = calculateDiff();
  
  // 同步时间标尺和内容的横向滚动
  const handleScroll = () => {
    if (scrollRef.current && timeRulerRef.current) {
      timeRulerRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  };
  
  useEffect(() => {
    // 计算最大 beat 数
    let max = 128;
    displayTracksWithDiff.forEach(track => {
      track.allClips.forEach(clip => {
        console.log(`Clip "${clip.name}": start=${clip.startTime}, end=${clip.endTime}, duration=${clip.endTime - clip.startTime}`);
        if (clip.endTime > max) {
          max = Math.ceil(clip.endTime / 16) * 16; // Round up to nearest 16
        }
      });
    });
    console.log(`Max beat calculated: ${max}`);
    setMaxBeat(max);
  }, [displayTracksWithDiff, zoom]);

  const totalWidth = maxBeat * pixelsPerBeat;
  
  // 生成时间标尺
  const beatMarks = [];
  for (let beat = 0; beat <= maxBeat; beat += 4) {
    beatMarks.push(
      <BeatMark key={beat} $position={beat * pixelsPerBeat}>
        {Math.floor(beat / 4) + 1}
      </BeatMark>
    );
  }

  return (
    <Container>
      <TimeRuler>
        <RulerLabel />
        <RulerScrollContainer ref={timeRulerRef}>
          <RulerMarks $width={totalWidth}>
            {beatMarks}
          </RulerMarks>
        </RulerScrollContainer>
      </TimeRuler>
      
      <ScrollContainer ref={scrollRef} onScroll={handleScroll}>
        <TracksContainer $width={totalWidth}>
          {displayTracksWithDiff.map((track, trackIndex) => (
            <TrackRow key={track.id}>
              <TrackLabel>
                <TrackName>{track.name}</TrackName>
              </TrackLabel>
              <ClipLane>
                {track.allClips.map((clip, idx) => {
                  const left = clip.startTime * pixelsPerBeat;
                  const width = Math.max((clip.endTime - clip.startTime) * pixelsPerBeat, 2); // 最小宽度 2px
                  console.log(`Rendering clip "${clip.name}": left=${left}px, width=${width}px, diffType=${clip.diffType}`);
                  
                  const diffLabel = clip.diffType === 'added' ? '(新增)' : 
                                   clip.diffType === 'removed' ? '(删除)' : 
                                   clip.diffType === 'modified' ? '(修改)' : '';
                  
                  return (
                    <ClipBox
                      key={`${clip.id}-${idx}`}
                      $left={left}
                      $width={width}
                      $trackIndex={trackIndex}
                      $isLooping={clip.isLooping}
                      $diffType={clip.diffType}
                      title={`${clip.name} ${diffLabel}\nStart: ${clip.startTime.toFixed(2)}\nEnd: ${clip.endTime.toFixed(2)}`}
                    >
                      <ClipName>{clip.name}</ClipName>
                      {clip.diffType && <DiffBadge $type={clip.diffType} />}
                    </ClipBox>
                  );
                })}
              </ClipLane>
            </TrackRow>
          ))}
        </TracksContainer>
      </ScrollContainer>
    </Container>
  );
}

export default ArrangementView;
