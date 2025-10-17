import * as pako from 'pako';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';

export interface ALSTrack {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'return' | 'master';
  color: number;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  clips: ALSClip[];
  devices: ALSDevice[];
}

export interface ALSClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  loopStart: number;
  loopEnd: number;
  isLooping: boolean;
  color: number;
  clipType?: 'audio' | 'midi'; // Differentiate between audio and MIDI clips
  file?: string;
  samplePath?: string;
  pitchCoarse?: number;
  pitchFine?: number;
  gain?: number;
}

export interface ALSDevice {
  id: string;
  name: string;
  type: string;
  isOn: boolean;
  parameters: { [key: string]: any };
}

export interface ALSProject {
  name: string;
  tempo: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  tracks: ALSTrack[];
  masterTrack?: ALSTrack;
}

export class ALSParser {
  /**
   * Parse an ALS file (which is a gzipped XML file)
   */
  static async parseFile(filePath: string): Promise<ALSProject> {
    try {
      // Read the file
      const compressedData = fs.readFileSync(filePath);
      
      // Decompress (ALS files are gzipped XML)
      const decompressedData = pako.ungzip(compressedData, { to: 'string' });
      
      // Parse XML
      const parsed = await parseStringPromise(decompressedData);
      
      // Extract project data
      return this.extractProjectData(parsed);
    } catch (error) {
      throw new Error(`Failed to parse ALS file: ${error}`);
    }
  }

  private static extractProjectData(xmlData: any): ALSProject {
    const ableton = xmlData.Ableton;
    const liveSet = ableton.LiveSet?.[0];

    if (!liveSet) {
      throw new Error('Invalid ALS file structure');
    }

    // Extract tempo
    const tempo = parseFloat(liveSet.MasterTrack?.[0]?.DeviceChain?.[0]?.Mixer?.[0]?.Tempo?.[0]?.Manual?.[0]?.$ ?.Value || '120');

    // Extract time signature
    const timeSignature = liveSet.MasterTrack?.[0]?.DeviceChain?.[0]?.Mixer?.[0]?.TimeSignature?.[0] || {};
    const timeSignatureNumerator = parseInt(timeSignature.TimeSignatureNumerator?.[0]?.$ ?.Value || '4');
    const timeSignatureDenominator = parseInt(timeSignature.TimeSignatureDenominator?.[0]?.$ ?.Value || '4');

    // Extract tracks - preserve original order by processing them together
    const tracks: ALSTrack[] = [];
    let globalTrackIndex = 0;
    
    // Get all track collections and their original indices
    const tracksNode = liveSet.Tracks?.[0];
    if (tracksNode) {
      // Create array to store tracks with their original order
      const orderedTracks: Array<{track: any, type: 'audio' | 'midi' | 'return', originalIndex: number}> = [];
      
      // Process AudioTracks
      if (tracksNode.AudioTrack) {
        tracksNode.AudioTrack.forEach((track: any, index: number) => {
          // Get original index from XML attributes if available
          const originalIndex = track.$?.Id ? parseInt(track.$.Id) : (index * 100); // fallback ordering
          orderedTracks.push({track, type: 'audio', originalIndex});
        });
      }
      
      // Process MidiTracks  
      if (tracksNode.MidiTrack) {
        tracksNode.MidiTrack.forEach((track: any, index: number) => {
          // Get original index from XML attributes if available
          const originalIndex = track.$?.Id ? parseInt(track.$.Id) : (index * 100 + 50); // fallback ordering
          orderedTracks.push({track, type: 'midi', originalIndex});
        });
      }
      
      // Process ReturnTracks
      if (tracksNode.ReturnTrack) {
        tracksNode.ReturnTrack.forEach((track: any, index: number) => {
          // Return tracks typically come after regular tracks
          const originalIndex = track.$?.Id ? parseInt(track.$.Id) : (1000 + index); // fallback ordering
          orderedTracks.push({track, type: 'return', originalIndex});
        });
      }
      
      // Sort by original index to preserve ALS track order
      orderedTracks.sort((a, b) => a.originalIndex - b.originalIndex);
      
      // Extract tracks in their original order
      orderedTracks.forEach(({track, type}) => {
        tracks.push(this.extractTrack(track, type, globalTrackIndex++));
      });
    }

    // Master track
    const masterTrack = liveSet.MasterTrack?.[0] ? this.extractTrack(liveSet.MasterTrack[0], 'master', globalTrackIndex) : undefined;

    return {
      name: 'Untitled Project',
      tempo,
      timeSignatureNumerator,
      timeSignatureDenominator,
      tracks,
      masterTrack,
    };
  }

  private static extractTrack(trackData: any, type: 'audio' | 'midi' | 'return' | 'master', index: number): ALSTrack {
    const name = trackData.Name?.[0]?.EffectiveName?.[0]?.$ ?.Value || `Track ${index + 1}`;
    const color = parseInt(trackData.Color?.[0]?.$ ?.Value || '0');
    
    // Extract mixer values
    const mixer = trackData.DeviceChain?.[0]?.Mixer?.[0];
    const volume = parseFloat(mixer?.Volume?.[0]?.Manual?.[0]?.$ ?.Value || '0.85');
    const pan = parseFloat(mixer?.Pan?.[0]?.Manual?.[0]?.$ ?.Value || '0');
    
    // Extract mute/solo state
    const isMuted = trackData.TrackMuted?.[0]?.$ ?.Value === 'true';
    const isSolo = trackData.Solo?.[0]?.$ ?.Value === 'true';

    // Extract clips
    const clips = this.extractClips(trackData);

    // Extract devices
    const devices = this.extractDevices(trackData);

    return {
      id: `track-${index}`,
      name,
      type,
      color,
      volume,
      pan,
      isMuted,
      isSolo,
      clips,
      devices,
    };
  }

  private static extractClips(trackData: any): ALSClip[] {
    const clips: ALSClip[] = [];
    
    try {
      // Collect clips from both sources
      const allClips: any[] = [];
      
      // Method 1: 从 DeviceChain -> MainSequencer -> Sample -> ArrangerAutomation -> Events -> AudioClip/MidiClip (主要用于Audio clips)
      const mainSequencer = trackData.DeviceChain?.[0]?.MainSequencer?.[0];
      const sample = mainSequencer?.Sample?.[0];
      const arrangerAutomation = sample?.ArrangerAutomation?.[0];
      const arrangerEvents = arrangerAutomation?.Events?.[0];
      
      if (arrangerEvents) {
        let audioClips = arrangerEvents.AudioClip;
        let midiClips = arrangerEvents.MidiClip;
        
        if (audioClips) {
          if (!Array.isArray(audioClips)) {
            audioClips = [audioClips];
          }
          allClips.push(...audioClips.map((clip: any) => ({ ...clip, type: 'audio' })));
        }
        
        if (midiClips) {
          if (!Array.isArray(midiClips)) {
            midiClips = [midiClips];
          }
          allClips.push(...midiClips.map((clip: any) => ({ ...clip, type: 'midi' })));
        }
      }
      
      // Method 2: 从 TakeLanes -> TakeLane -> ClipAutomation -> Events -> MidiClip (主要用于MIDI clips)
      const takeLanes = trackData.TakeLanes?.[0]?.TakeLanes?.[0];
      if (takeLanes && Array.isArray(takeLanes.TakeLane)) {
        // Process all TakeLanes
        for (const takeLane of takeLanes.TakeLane) {
          const takeLaneEvents = takeLane?.ClipAutomation?.[0]?.Events?.[0];
          if (takeLaneEvents) {
            let audioClips = takeLaneEvents.AudioClip;
            let midiClips = takeLaneEvents.MidiClip;
            
            if (audioClips) {
              if (!Array.isArray(audioClips)) {
                audioClips = [audioClips];
              }
              allClips.push(...audioClips.map((clip: any) => ({ ...clip, type: 'audio' })));
            }
            
            if (midiClips) {
              if (!Array.isArray(midiClips)) {
                midiClips = [midiClips];
              }
              allClips.push(...midiClips.map((clip: any) => ({ ...clip, type: 'midi' })));
            }
          }
        }
      }
      
      if (allClips.length === 0) {
        // No clips found
        return clips;
      }

      // Only log summary if there are many clips to avoid Railway log rate limits
      if (allClips.length > 50) {
        const audioCount = allClips.filter(clip => clip.type === 'audio').length;
        const midiCount = allClips.filter(clip => clip.type === 'midi').length;
        console.log(`Processing track with ${allClips.length} clips (Audio: ${audioCount}, MIDI: ${midiCount})`);
      }

      allClips.forEach((clip: any, index: number) => {
        try {
          const clipType = clip.type; // 'audio' or 'midi'
          
          // 使用 $ 对象访问属性(xml2js 的标准方式)
          const startTime = parseFloat(clip.$?.Time || '0');
          
          // CurrentEnd 包含结束时间
          const currentEnd = clip.CurrentEnd?.[0];
          const endTime = parseFloat(currentEnd?.$?.Value || '0');
          
          // 获取 clip 名称
          const nameData = clip.Name?.[0];
          const name = nameData?.$?.Value || `${clipType === 'midi' ? 'MIDI' : 'Audio'} Clip ${index + 1}`;
          
          // Removed excessive logging to improve performance
          
          // Extract loop settings
          const loopData = clip.Loop?.[0] || {};
          const loopOn = loopData.LoopOn?.[0];
          const isLooping = (loopOn?.$?.Value || 'false') === 'true';
          
          const loopStartData = loopData.LoopStart?.[0];
          const loopStart = parseFloat(loopStartData?.$?.Value || '0');
          
          const loopEndData = loopData.LoopEnd?.[0];
          const loopEnd = parseFloat(loopEndData?.$?.Value || '0');
          
          // Extract color
          const colorData = clip.Color?.[0];
          const color = parseInt(colorData?.$?.Value || '0');
          
          // Extract sample path (only for audio clips)
          let samplePath = '';
          if (clipType === 'audio') {
            const sampleRef = clip.SampleRef?.[0];
            const fileRef = sampleRef?.FileRef?.[0];
            const pathData = fileRef?.Path?.[0];
            samplePath = pathData?.$?.Value || '';
            
            // Normalize sample path
            if (samplePath) {
              samplePath = samplePath.replace(/\\/g, '/');
              const parts = samplePath.split('/');
              const audioIndex = parts.findIndex((p: string) => p.toLowerCase() === 'audio');
              if (audioIndex >= 0 && audioIndex < parts.length - 1) {
                samplePath = parts.slice(audioIndex + 1).join('/');
              }
            }
          }
          
          // Extract pitch shift (audio clips) or transpose (MIDI clips)
          const pitchCoarseData = clip.PitchCoarse?.[0];
          const pitchCoarse = parseFloat(pitchCoarseData?.$?.Value || '0');
          
          const pitchFineData = clip.PitchFine?.[0];
          const pitchFine = parseFloat(pitchFineData?.$?.Value || '0');
          
          // Extract gain (audio clips only)
          const gainData = clip.Gain?.[0];
          const gain = parseFloat(gainData?.$?.Value || '1.0');

          clips.push({
            id: `clip-${clipType}-${index}`,
            name,
            startTime,
            endTime,
            loopStart,
            loopEnd,
            isLooping,
            color,
            clipType, // Add clip type to differentiate audio and MIDI
            samplePath,
            pitchCoarse,
            pitchFine,
            gain,
          });
          
          // Removed excessive logging to improve performance
        } catch (err) {
          console.error(`Error parsing clip ${index}:`, err);
        }
      });
    } catch (error) {
      console.error('Error extracting clips:', error);
    }

    return clips;
  }

  private static extractDevices(trackData: any): ALSDevice[] {
    const devices: ALSDevice[] = [];
    const deviceChain = trackData.DeviceChain?.[0]?.DeviceChain?.[0]?.Devices?.[0];

    if (!deviceChain) return devices;

    // Iterate through different device types
    const deviceTypes = Object.keys(deviceChain);
    deviceTypes.forEach((deviceType) => {
      const deviceList = deviceChain[deviceType];
      if (Array.isArray(deviceList)) {
        deviceList.forEach((device: any, index: number) => {
          const name = device.UserName?.[0]?.$ ?.Value || deviceType;
          const isOn = device.On?.[0]?.Manual?.[0]?.$ ?.Value !== 'false';

          devices.push({
            id: `device-${deviceType}-${index}`,
            name,
            type: deviceType,
            isOn,
            parameters: {},
          });
        });
      }
    });

    return devices;
  }

  /**
   * Convert parsed ALS project to JSON string
   */
  static toJSON(project: ALSProject): string {
    return JSON.stringify(project, null, 2);
  }
}
