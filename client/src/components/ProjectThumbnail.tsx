import { useEffect, useRef } from 'react';

// Color palette for track visualization (based on Ableton Live colors)
const TRACK_COLORS = [
  '#FF5C5C', '#FF9A00', '#FFD700', '#7CFC00', '#00CED1',
  '#1E90FF', '#9370DB', '#FF69B4', '#DC143C', '#FF8C00',
  '#FFD700', '#32CD32', '#00BFFF', '#BA55D3', '#FF1493',
  '#F08080', '#FFA07A', '#F0E68C', '#98FB98', '#AFEEEE',
  '#87CEEB', '#DDA0DD'
];

interface ProjectThumbnailProps {
  projectId: string;
  projectName: string;
}

function ProjectThumbnail({ projectId, projectName }: ProjectThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Ensure canvas has valid dimensions
    if (rect.width === 0 || rect.height === 0) {
      console.warn('Canvas has zero dimensions, skipping render');
      return;
    }
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Try to fetch and render project data, fallback to placeholder if fails
    fetchAndRenderProject(projectId, ctx, rect.width, rect.height).catch(() => {
      // Render placeholder if fetch fails
      renderPlaceholder(ctx, rect.width, rect.height);
    });
  }, [projectId]);

  const fetchAndRenderProject = async (
    id: string,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    try {
      console.log('[ProjectThumbnail] Fetching project data for:', id);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Fetch the version history of the project
      const response = await fetch(`${API_BASE_URL}/api/versions/${id}/history`);
      if (!response.ok) {
        console.warn('[ProjectThumbnail] Failed to fetch versions for project:', id, 'status:', response.status);
        renderPlaceholder(ctx, width, height);
        return;
      }

      const versions = await response.json();
      console.log('[ProjectThumbnail] Received versions:', versions);
      
      if (!versions || versions.length === 0) {
        console.warn('[ProjectThumbnail] No versions found for project:', id);
        renderPlaceholder(ctx, width, height);
        return;
      }

      console.log('[ProjectThumbnail] Found', versions.length, 'versions for project:', id);

      // Get the latest version data
      const latestVersion = versions[0];
      console.log('[ProjectThumbnail] Latest version:', latestVersion);
      
      const versionResponse = await fetch(
        `${API_BASE_URL}/api/projects/${id}/version/${latestVersion.id}`
      );
      if (!versionResponse.ok) {
        console.warn('[ProjectThumbnail] Failed to fetch version data for version:', latestVersion.id, 'status:', versionResponse.status);
        renderPlaceholder(ctx, width, height);
        return;
      }

      const versionResult = await versionResponse.json();
      console.log('[ProjectThumbnail] Got version result:', versionResult);
      console.log('[ProjectThumbnail] Version data tracks:', versionResult.data?.tracks);
      
      if (versionResult.data && versionResult.data.tracks) {
        renderProjectData(versionResult.data, ctx, width, height);
      } else {
        console.warn('[ProjectThumbnail] No track data in version, full result:', JSON.stringify(versionResult, null, 2));
        renderPlaceholder(ctx, width, height);
      }
    } catch (error) {
      console.error('[ProjectThumbnail] Error rendering project thumbnail:', error);
      renderPlaceholder(ctx, width, height);
    }
  };

  const renderPlaceholder = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw a simple placeholder with varied clip arrangements to simulate real project
    const numTracks = 6;
    const trackHeight = height / numTracks;
    
    // Define some varied clip patterns to make it look more realistic
    const clipPatterns = [
      [{ start: 0, duration: 32 }, { start: 48, duration: 16 }, { start: 80, duration: 32 }],
      [{ start: 0, duration: 64 }, { start: 80, duration: 32 }],
      [{ start: 16, duration: 32 }, { start: 64, duration: 48 }],
      [{ start: 0, duration: 16 }, { start: 32, duration: 16 }, { start: 64, duration: 32 }],
      [{ start: 32, duration: 80 }],
      [{ start: 0, duration: 112 }],
    ];
    
    const maxTime = 112;
    
    for (let i = 0; i < numTracks; i++) {
      const y = i * trackHeight;
      const color = TRACK_COLORS[i % TRACK_COLORS.length];
      
      // Draw track background (alternating)
      ctx.fillStyle = i % 2 === 0 ? '#0e0e0e' : '#121212';
      ctx.fillRect(0, y, width, trackHeight);
      
      // Draw clips with varied positions
      const pattern = clipPatterns[i % clipPatterns.length];
      pattern.forEach(clip => {
        const clipStart = (clip.start / maxTime) * width;
        const clipWidth = (clip.duration / maxTime) * width;
        const clipHeight = trackHeight - 4;
        
        // Draw clip with transparency
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(clipStart, y + 2, clipWidth, clipHeight);
        ctx.globalAlpha = 1.0;
        
        // Draw clip border
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(clipStart, y + 2, clipWidth, clipHeight);
      });
      
      // Draw separator
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw project name overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height - 30, width, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(projectName, width / 2, height - 15);
  };

  const renderProjectData = (
    data: any,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const tracks = data.tracks || [];
    console.log('Rendering project data, tracks count:', tracks.length);
    
    if (tracks.length === 0) {
      console.warn('No tracks to render');
      renderPlaceholder(ctx, width, height);
      return;
    }

    const trackHeight = height / tracks.length;

    // Find the maximum time across all clips using startTime and endTime
    let maxTime = 0;
    let totalClips = 0;
    tracks.forEach((track: any) => {
      const clipCount = track.clips?.length || 0;
      totalClips += clipCount;
      track.clips?.forEach((clip: any) => {
        const endTime = clip.endTime || 0;
        if (endTime > maxTime) maxTime = endTime;
      });
    });

    console.log('Total clips:', totalClips, 'Max time:', maxTime);

    if (maxTime === 0) maxTime = 32; // Default to 32 beats if no clips

    // Render each track
    tracks.forEach((track: any, trackIndex: number) => {
      const y = trackIndex * trackHeight;

      // Draw track background (alternating slightly for visibility)
      ctx.fillStyle = trackIndex % 2 === 0 ? '#0e0e0e' : '#121212';
      ctx.fillRect(0, y, width, trackHeight);

      // Draw track separator
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Get track color - use the track's color property
      const color = TRACK_COLORS[track.color % TRACK_COLORS.length];

      // Draw clips
      const clips = track.clips || [];
      clips.forEach((clip: any) => {
        const clipStartTime = clip.startTime || 0;
        const clipEndTime = clip.endTime || 0;
        const clipDuration = clipEndTime - clipStartTime;
        
        const clipStart = (clipStartTime / maxTime) * width;
        const clipWidth = (clipDuration / maxTime) * width;
        const clipHeight = trackHeight - 4; // Add padding

        if (clipWidth > 0) {
          // Draw clip with semi-transparent background
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.7;
          ctx.fillRect(clipStart, y + 2, clipWidth, clipHeight);
          ctx.globalAlpha = 1.0;

          // Draw clip border
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(clipStart, y + 2, clipWidth, clipHeight);
        }
      });
    });

    // Draw project name overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, height - 30, width, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(projectName, width / 2, height - 15);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
}

export default ProjectThumbnail;
