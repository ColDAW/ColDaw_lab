# VST Plugin Documentation

## Overview

JUCE-based VST3 plugin for exporting Ableton Live projects to ColDaw.

## Features

- One-click project export from Ableton Live
- Auto-detect currently open project
- Direct authentication with ColDaw
- Auto-export mode (uploads on save)

## Build Requirements

- CMake 3.15+
- C++17 compiler (Xcode/Visual Studio/GCC)
- JUCE Framework (included as submodule)

## Build Instructions

### macOS
```bash
cd vst-plugin
./build.sh
# Output: build/ColDaw_artefacts/Release/VST3/ColDaw.vst3
```

### Windows
```bash
cd vst-plugin
mkdir build && cd build
cmake .. -G "Visual Studio 16 2019" -A x64
cmake --build . --config Release
```

### Linux
```bash
cd vst-plugin
mkdir build && cd build
cmake .. && make -j$(nproc)
```

## Installation

### macOS
```bash
cp -r build/ColDaw_artefacts/Release/VST3/ColDaw.vst3 \
  ~/Library/Audio/Plug-Ins/VST3/
```

### Windows
```bash
copy "build\ColDaw_artefacts\Release\VST3\ColDaw.vst3" \
  "%COMMONPROGRAMFILES%\VST3\"
```

### Linux
```bash
cp -r build/ColDaw_artefacts/Release/VST3/ColDaw.vst3 \
  ~/.vst3/
```

## Usage

1. Open plugin in Ableton Live (drag onto MIDI track)
2. Enter ColDaw username/password → Login
3. Plugin detects current project automatically
4. Click "Export Project" to upload
5. Enable "Auto Export" for automatic uploads on save

## Configuration

Settings stored in:
- macOS: `~/Library/Application Support/ColDaw/settings.xml`
- Windows: `%APPDATA%\ColDaw\settings.xml`
- Linux: `~/.config/ColDaw/settings.xml`

```xml
<COLDAW_SETTINGS>
  <API_ENDPOINT value="https://coldawlab-production.up.railway.app"/>
  <AUTO_EXPORT enabled="false"/>
  <UPLOAD_TIMEOUT value="30000"/>
</COLDAW_SETTINGS>
```

## Architecture

```cpp
// Core components
class ColDawPlugin : public juce::AudioProcessor {
  // HTTP client for API calls
  std::unique_ptr<HttpClient> httpClient;
  
  // Detects Ableton project files
  std::unique_ptr<ProjectDetector> projectDetector;
  
  // Plugin UI
  std::unique_ptr<PluginEditor> editor;
};

// Project detection
ProjectDetector::getCurrentProject() {
  // Scans Ableton preferences for recent projects
  // Returns most recently modified .als file
}

// Upload
HttpClient::uploadProject(file) {
  // POST to /api/projects/upload
  // Sends .als file as multipart/form-data
}
```

## Troubleshooting

**Plugin not in Ableton**: 
- Rescan plugins in Ableton preferences
- Check installation path
- Restart Ableton

**Login fails**:
- Verify ColDaw credentials
- Check internet connection
- Test server URL in browser

**Upload fails**:
- Check file size (max 500MB)
- Ensure project is saved
- Check server logs

## Debug Logging

```bash
# Enable logging
export COLDAW_DEBUG=1  # macOS/Linux
set COLDAW_DEBUG=1     # Windows

# Logs location
~/Library/Logs/ColDaw/plugin.log          # macOS
%APPDATA%\ColDaw\Logs\plugin.log          # Windows
~/.local/share/ColDaw/logs/plugin.log     # Linux
```
