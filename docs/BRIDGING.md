# Bridging Documentation

## Overview

ColDaw parses Ableton `.als` files (gzipped XML) and converts them to JSON/XML for web visualization and external platform integration.

## Ableton Parsing

### File Format

```
project.als (gzipped XML)
└── Uncompressed XML:
    ├── LiveSet
    │   ├── Tracks (Audio, MIDI, Return, Master)
    │   ├── Tempo
    │   ├── TimeSignature
    │   └── Locators
    └── Project metadata
```

### Parsing Pipeline

```typescript
// server/src/services/abletonParser.ts
import { gunzipSync } from 'zlib';
import * as xml2js from 'xml2js';

export const parseAbletonProject = async (filePath: string) => {
  // 1. Read & decompress
  const compressed = await fs.readFile(filePath);
  const xml = gunzipSync(compressed).toString('utf-8');
  
  // 2. Parse XML
  const parser = new xml2js.Parser();
  const parsed = await parser.parseStringPromise(xml);
  const liveset = parsed.Ableton.LiveSet[0];
  
  // 3. Extract data
  return {
    tempo: extractTempo(liveset),
    timeSignature: extractTimeSignature(liveset),
    tracks: extractTracks(liveset),
    clips: extractClips(liveset),
    devices: extractDevices(liveset),
    automation: extractAutomation(liveset)
  };
};
```

### Data Extraction

```typescript
// Extract tempo
const extractTempo = (liveset) => {
  return parseFloat(
    liveset.MasterTrack[0]
      .DeviceChain[0].Mixer[0].Tempo[0].Manual[0].$.Value
  );
};

// Extract tracks
const extractTracks = (liveset) => {
  const audioTracks = liveset.Tracks[0].AudioTrack || [];
  const midiTracks = liveset.Tracks[0].MidiTrack || [];
  
  return [...audioTracks, ...midiTracks].map((track, i) => ({
    id: `track-${i}`,
    name: track.Name[0].EffectiveName[0].$.Value,
    type: track.$.Id.includes('Audio') ? 'audio' : 'midi',
    color: track.Color[0].$.Value,
    volume: parseFloat(track.DeviceChain[0].Mixer[0].Volume[0].Manual[0].$.Value),
    pan: parseFloat(track.DeviceChain[0].Mixer[0].Pan[0].Manual[0].$.Value),
    muted: track.DeviceChain[0].Mixer[0].IsMuted[0].$.Value === 'true',
    clips: extractClipsFromTrack(track)
  }));
};
```

## JSON Output

```json
{
  "id": "project-uuid",
  "name": "My Track",
  "tempo": 120.0,
  "timeSignature": "4/4",
  "tracks": [
    {
      "id": "track-0",
      "name": "Kick",
      "type": "audio",
      "volume": 0.85,
      "pan": 0.0,
      "clips": [
        {
          "id": "clip-0",
          "name": "Kick Sample",
          "start": 0.0,
          "end": 4.0,
          "loop": { "start": 0.0, "end": 4.0, "enabled": true }
        }
      ]
    }
  ]
}
```

## TouchDesigner Integration

### REST API

```typescript
// GET /api/projects/:id/touchdesigner
router.get('/projects/:id/touchdesigner', authenticate, async (req, res) => {
  const project = await getProject(req.params.id);
  const parsed = await parseAbletonProject(project.filePath);
  
  res.json({
    tempo: parsed.tempo,
    tracks: parsed.tracks.map(t => ({
      name: t.name,
      volume: t.volume,
      clips: t.clips.map(c => ({
        name: c.name,
        startTime: c.start,
        duration: c.end - c.start
      }))
    })),
    automation: parsed.automation
  });
});
```

### TouchDesigner Client

**REST Polling**:
```python
# TouchDesigner Python
import requests

def onFrameStart(frame):
    if frame % 30 == 0:  # Poll every 30 frames
        r = requests.get('https://coldaw.com/api/projects/ID/touchdesigner',
                        headers={'Authorization': f'Bearer {TOKEN}'})
        data = r.json()
        op('tempo').par.value0 = data['tempo']
```

**WebSocket Real-Time**:
```python
import websocket

ws = websocket.create_connection('wss://coldaw.com')
ws.send(json.dumps({'type': 'join-project', 'projectId': 'ID'}))

def onMessage(ws, message):
    data = json.loads(message)
    if data['type'] == 'project-update':
        updateVisuals(data['changes'])
```

**OSC Bridge**:
```typescript
// Server sends OSC
import osc from 'node-osc';
const client = new osc.Client('127.0.0.1', 9000);

client.send('/tempo', project.tempo);
client.send('/track/0/volume', track.volume);
```

```python
# TouchDesigner receives OSC
# OSC In CHOP → port 9000
# Map /tempo → tempo CHOP
```

## API Endpoints

### Available
```typescript
GET  /api/projects/:id                // Full project JSON
GET  /api/projects/:id/touchdesigner  // TouchDesigner format
POST /api/projects/:id/export/json    // Download JSON
POST /api/projects/:id/export/xml     // Download XML
```

## Future Integrations (TODO)

### Unity
- **Use case**: Music-driven games, VR experiences
- **Endpoint**: `GET /api/projects/:id/unity`
- **Features**: Audio clip refs, timeline sync, MIDI triggers

### Unreal Engine
- **Use case**: Virtual production, music videos
- **Endpoint**: `GET /api/projects/:id/unreal`
- **Features**: Audio cues, parameter curves, sequencer data

### Max/MSP
- **Use case**: Live performance, algorithmic composition
- **Method**: JSON export + Max JS
- **Features**: MIDI routing, parameter mapping, real-time sync

### Processing
- **Use case**: Generative art, visualization
- **Method**: REST API + HTTP library
- **Features**: Beat detection, spectrum, amplitude

### MIDI Export
- **Use case**: Import to other DAWs, hardware
- **Endpoint**: `GET /api/projects/:id/midi`
- **Format**: .mid (Standard MIDI Format 1)

### MusicXML Export
- **Use case**: Sheet music, notation software
- **Endpoint**: `GET /api/projects/:id/musicxml`
- **Format**: .musicxml / .mxl

## Roadmap

**Completed**:
- [x] Ableton .als parsing
- [x] JSON export
- [x] PostgreSQL storage

**In Progress**:
- [ ] TouchDesigner REST endpoint
- [ ] WebSocket bridge
- [ ] OSC server

**Planned**:
- [ ] Unity integration
- [ ] Unreal Engine integration
- [ ] Max/MSP bridge
- [ ] Processing library
- [ ] MIDI file export
- [ ] MusicXML export

## Testing

```bash
# Test parsing
curl http://localhost:3001/api/projects/ID

# Test TouchDesigner format
curl http://localhost:3001/api/projects/ID/touchdesigner \
  -H "Authorization: Bearer TOKEN"
```

## Contributing

To add platform integration:
1. Create endpoint in `routes/projects.ts`
2. Add parser in `services/bridging/`
3. Define output format
4. Add tests
5. Update this doc
