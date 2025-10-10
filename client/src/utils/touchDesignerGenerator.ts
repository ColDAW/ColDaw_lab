// TouchDesigner Project Generator
// This utility creates TouchDesigner .toe files from DAW project data

interface TouchDesignerNode {
  name: string;
  type: string;
  position: [number, number];
  parameters?: Record<string, any>;
  inputs?: string[];
  outputs?: string[];
}

interface TouchDesignerProject {
  version: string;
  build: string;
  metadata: {
    name: string;
    author: string;
    created: string;
    version: string;
  };
  network: {
    nodes: TouchDesignerNode[];
    connections: Array<{
      from: string;
      fromOutput: string;
      to: string;
      toInput: string;
    }>;
  };
  project: {
    settings: Record<string, any>;
    timeline: {
      fps: number;
      length: number;
    };
  };
}

export class TouchDesignerGenerator {
  private projectData: any;
  private projectName: string;
  private versionId: string;

  constructor(projectData: any, projectName: string, versionId: string) {
    this.projectData = projectData;
    this.projectName = projectName;
    this.versionId = versionId;
  }

  generateProject(): string {
    const toeProject: TouchDesignerProject = {
      version: "2023.11340",
      build: "TouchDesigner 2023.11340",
      metadata: {
        name: this.projectName,
        author: "ColDaw Export",
        created: new Date().toISOString(),
        version: this.versionId.substring(0, 8)
      },
      network: {
        nodes: [],
        connections: []
      },
      project: {
        settings: {
          realtime: true,
          start: true,
          quit: false
        },
        timeline: {
          fps: 60,
          length: this.calculateProjectLength()
        }
      }
    };

    // Generate nodes and connections
    this.generateNodes(toeProject);
    this.generateConnections(toeProject);

    // Return as JSON string (in real implementation, this would be binary .toe format)
    return JSON.stringify(toeProject, null, 2);
  }

  private calculateProjectLength(): number {
    if (!this.projectData || !this.projectData.tracks) return 1000;
    
    let maxLength = 0;
    this.projectData.tracks.forEach((track: any) => {
      if (track.clips) {
        track.clips.forEach((clip: any) => {
          const clipEnd = (clip.startTime || 0) + (clip.duration || 0);
          maxLength = Math.max(maxLength, clipEnd);
        });
      }
    });
    
    return Math.max(maxLength * 60, 1000); // Convert to frames (assuming 60fps)
  }

  private generateNodes(project: TouchDesignerProject): void {
    if (!this.projectData || !this.projectData.tracks) return;

    // Create master control DAT
    project.network.nodes.push({
      name: "project_data",
      type: "tableDAT",
      position: [0, 0],
      parameters: {
        rows: this.projectData.tracks.length + 1,
        cols: 10,
        data: this.generateProjectDataTable()
      }
    });

    // Create master output CHOP
    project.network.nodes.push({
      name: "master_out",
      type: "outCHOP",
      position: [800, -200],
      parameters: {
        chop: "master_mix"
      }
    });

    // Create mixer CHOP
    project.network.nodes.push({
      name: "master_mix",
      type: "mathCHOP",
      position: [600, -200],
      parameters: {
        operation: "add",
        channels: "mix*"
      }
    });

    // Generate nodes for each track
    this.projectData.tracks.forEach((track: any, index: number) => {
      this.generateTrackNodes(project, track, index);
    });
  }

  private generateTrackNodes(project: TouchDesignerProject, track: any, index: number): void {
    const yPos = index * -150;
    const baseX = 100;

    // Track data DAT
    project.network.nodes.push({
      name: `track_${index}_data`,
      type: "tableDAT",
      position: [baseX, yPos],
      parameters: {
        data: this.generateTrackDataTable(track, index)
      }
    });

    // Track parameters DAT
    project.network.nodes.push({
      name: `track_${index}_params`,
      type: "tableDAT",
      position: [baseX + 150, yPos],
      parameters: {
        data: this.generateTrackParamsTable(track)
      }
    });

    // Audio oscillator CHOP (simulates audio content)
    project.network.nodes.push({
      name: `track_${index}_osc`,
      type: "oscCHOP",
      position: [baseX + 300, yPos],
      parameters: {
        frequency: this.getTrackFrequency(track, index),
        amplitude: track.volume || 0.8,
        channels: 1
      }
    });

    // Track effects CHOP
    project.network.nodes.push({
      name: `track_${index}_fx`,
      type: "filterCHOP",
      position: [baseX + 450, yPos],
      parameters: {
        filter: "lowpass",
        cutoff: this.getTrackCutoff(track)
      }
    });

    // Track mix CHOP
    project.network.nodes.push({
      name: `track_${index}_mix`,
      type: "mathCHOP",
      position: [baseX + 600, yPos],
      parameters: {
        operation: "multiply",
        gain: track.volume || 0.8
      }
    });
  }

  private generateConnections(project: TouchDesignerProject): void {
    if (!this.projectData || !this.projectData.tracks) return;

    this.projectData.tracks.forEach((_track: any, index: number) => {
      // Connect track chain: osc -> fx -> mix
      project.network.connections.push({
        from: `track_${index}_osc`,
        fromOutput: "chan1",
        to: `track_${index}_fx`,
        toInput: "chop"
      });

      project.network.connections.push({
        from: `track_${index}_fx`,
        fromOutput: "chan1",
        to: `track_${index}_mix`,
        toInput: "chop1"
      });

      // Connect to master mix
      project.network.connections.push({
        from: `track_${index}_mix`,
        fromOutput: "chan1",
        to: "master_mix",
        toInput: `mix${index}`
      });
    });

    // Connect master mix to output
    project.network.connections.push({
      from: "master_mix",
      fromOutput: "chan1",
      to: "master_out",
      toInput: "chop"
    });
  }

  private generateProjectDataTable(): string[][] {
    const table: string[][] = [
      ["Property", "Value", "Type", "Description"]
    ];

    table.push(["name", this.projectName, "string", "Project name"]);
    table.push(["version", this.versionId.substring(0, 8), "string", "Version ID"]);
    table.push(["tracks", String(this.projectData.tracks?.length || 0), "int", "Number of tracks"]);
    table.push(["tempo", String(this.projectData.tempo || 120), "float", "BPM"]);
    table.push(["duration", String(this.calculateProjectLength()), "int", "Duration in frames"]);

    return table;
  }

  private generateTrackDataTable(track: any, index: number): string[][] {
    const table: string[][] = [
      ["Property", "Value", "Type", "Description"]
    ];

    table.push(["id", String(index), "int", "Track ID"]);
    table.push(["name", track.name || `Track ${index + 1}`, "string", "Track name"]);
    table.push(["type", track.type || "audio", "string", "Track type"]);
    table.push(["volume", String(track.volume || 0.8), "float", "Track volume"]);
    table.push(["pan", String(track.pan || 0), "float", "Track pan"]);
    table.push(["muted", String(track.muted || false), "bool", "Is muted"]);
    table.push(["solo", String(track.solo || false), "bool", "Is solo"]);

    if (track.clips) {
      table.push(["clips", String(track.clips.length), "int", "Number of clips"]);
    }

    return table;
  }

  private generateTrackParamsTable(track: any): string[][] {
    const table: string[][] = [
      ["Parameter", "Value", "Min", "Max", "Type"]
    ];

    // Add track-specific parameters
    if (track.effects) {
      track.effects.forEach((effect: any, i: number) => {
        table.push([`fx${i}_type`, effect.type || "none", "", "", "string"]);
        table.push([`fx${i}_wet`, String(effect.wet || 0.5), "0", "1", "float"]);
        if (effect.parameters) {
          Object.entries(effect.parameters).forEach(([key, value]) => {
            table.push([`fx${i}_${key}`, String(value), "0", "1", "float"]);
          });
        }
      });
    }

    return table;
  }

  private getTrackFrequency(_track: any, index: number): number {
    // Generate different frequencies for different tracks
    const baseFreqs = [440, 554, 659, 784, 880, 988, 1108]; // A4, C#5, E5, G5, A5, B5, C#6
    return baseFreqs[index % baseFreqs.length];
  }

  private getTrackCutoff(track: any): number {
    // Default cutoff frequency, can be modified based on track effects
    return track.effects?.find((fx: any) => fx.type === 'filter')?.cutoff || 8000;
  }
}

export function generateTouchDesignerProject(projectData: any, projectName: string, versionId: string): string {
  const generator = new TouchDesignerGenerator(projectData, projectName, versionId);
  return generator.generateProject();
}