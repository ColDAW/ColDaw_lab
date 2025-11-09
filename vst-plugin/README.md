


One-click export VST3 plugin for uploading Ableton Live projects to the ColDaw collaboration platform.






## 📖 Table of Contents




- [System Requirements](#system-requirements)

- [Installation & Build](#installation--build)

- [Usage Guide](#usage-guide)


- [Development & Debugging](#development--debugging)











- ✅ **One-Click Export**: Quickly upload Ableton Live projects to ColDaw


- ✅ **Auto-Monitor**: Optional auto-upload mode for every save


- ✅ **User Authentication**: Built-in login/logout functionality


- ✅ **Browser Integration**: Auto-open project in browser after successful export




### User Interface

Plugin interface divided into three main areas:


1. **Login Area** (Top 240px)


   - Password input field (masked)


   - Login status label


2. **Project Export Area** (Middle)


   - Export button (enabled after login)


   - Export status display


3. **Settings Area** (Bottom)


   - Auto-export toggle


---


## 🔧 System Requirements


### Development Environment


  - macOS: Xcode 12+ (C++17 support)


  - Linux: GCC 9+ or Clang 10+

- **CMake**: 3.15 or higher

- **JUCE Framework**: 7.0+ (requires separate download)


### Runtime Environment


- **ColDaw Server**: Running ColDaw backend service (local or remote)

cd /Users/yifan/Documents/WebD/ColDaw

---


## 🚀 Installation & Build


### Step 1: Install JUCE Framework


JUCE is the C++ framework required for building VST plugins.


```bash


cd /Users/yifan/Documents/WebD/ColDaw_lab

git clone https://github.com/juce-framework/JUCE.git




# https://github.com/juce-framework/JUCE/releases





```


├── JUCE/              # JUCE framework


├── client/            # Web frontend

└── server/            # Backend servercd /Users/yifan/Documents/WebD/ColDaw/vst-plugin

```


### Step 2: Build Plugin


#### macOS Build


Using the provided build script (recommended):

cd build

```bash

cd vst-plugin---

./build.sh







```bash

cd vst-plugin


cd build


# Configure CMake (specify JUCE path)





cmake --build . --config Release





- VST3: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`


- Standalone: `build/ColDaw Export_artefacts/Release/Standalone/ColDaw Export.app`



#### Windows Build


```powershell


mkdir build




# Configure CMake (using Visual Studio 2022)cd C:\path\to\ColDaw\vst-plugin

cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"

---

# Compile


```


**Build artifacts location:**

- VST3: `C:\Program Files\Common Files\VST3\ColDaw Export.vst3`cd build

- Standalone: `build\ColDaw Export_artefacts\Release\Standalone\ColDaw Export.exe`


#### Linux Build


```bash




# Install dependencies (first time only)

sudo apt-get install libasound2-dev libcurl4-openssl-dev \


    libxinerama-dev libxrandr-dev libxrender-dev


# Create build directory

mkdir -p buildcd /Users/yifan/Documents/WebD/ColDaw_lab

cd build


# Configure and compile

cmake .. -DJUCE_PATH=../../JUCE# VST3: C:\Program Files\Common Files\VST3\ColDaw Export.vst3

cmake --build . --config Release




**Build artifacts location:**# https://github.com/juce-framework/JUCE/releases

- VST3: `~/.vst3/ColDaw Export.vst3`

- Standalone: `build/ColDaw Export_artefacts/Release/Standalone/ColDaw Export````### Linux



### Step 3: Verify Installation






**macOS**:```cd /path/to/ColDaw/vst-plugin

```bash

ls -la ~/Library/Audio/Plug-Ins/VST3/ | grep ColDawColDaw_lab/

```


**Windows**:


dir "C:\Program Files\Common Files\VST3\" | findstr ColDaw





```bash

ls -la ~/.vst3/ | grep ColDaw```

```


#### Test in DAW


1. Launch Ableton Live (or other DAW)

2. Refresh plugin list (if needed)cd build

3. Add "ColDaw Export" plugin to any track










### First-Time Setupcmake --build . --config Release



#### 1. Start ColDaw Server```bash




```bash

cd ColDaw_lab./build.sh# VST3: ~/.vst3/ColDaw Export.vst3

./start.sh

`````````



Server will run at `http://localhost:3001`.




Plugin is pre-configured to connect to: `https://coldawlab-production.up.railway.app`



#### 2. Load Plugin in Ableton Live


1. Open Ableton Live

2. Add effect to any trackcd vst-plugin

3. Select "Audio Effects" → "ColDaw Export"




#### 3. Login to ColDawcd build



In plugin's top login area:```bash




2. Enter **Password**: `demo123`


4. Wait for login status to show "✓ Logged in as: demo@coldaw.com"

```

**Demo Accounts:**


| Email | Password |


| `demo@coldaw.com` | `demo123` |

| `test@coldaw.com` | `test123` |```- **macOS VST3**: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`



### Export Projects- **macOS AU**: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`







2. Open or save a project in Ableton Live

3. Click **"Export Current Project"** button in plugin- AU: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`

4. Plugin will:


   - Upload to ColDaw server

   - Auto-open project page in browser







2. Click **"Choose .als File"** button


4. File will upload immediately

cd vst-plugin

#### Method 3: Auto-Export Mode


1. Ensure you are logged in

2. Check **"Auto Export on Save"** in settings areacd build

3. Every time you save project in Ableton Live, plugin auto-uploads










1. In plugin bottom "Server URL" input field, enter:

   ```


   ```


3. Plugin now connects to local server


#### Connect to Production Server (Default)

   

Plugin default configuration:


https://coldawlab-production.up.railway.app







### Logout















```

┌─────────────────────────────────────────────────────────────┐


│  ┌────────────────────────────────────────────────────┐     │

│  │           ColDaw Export Plugin (VST3)              │     │sudo apt-get install libasound2-dev libcurl4-openssl-dev \

│  │                                                     │     │


│  │  │ GUI Editor   │◄────────┤ Processor    │        │     │

│  │  │              │         │              │        │     │    libxinerama-dev libxrandr-dev libxrender-dev

│  │  │ - Login UI   │         │ - File detect│        │     │


│  │  │ - Settings   │         │ - HTTP upload│        │     │


│  │  └──────────────┘         └──────┬───────┘        │     │


│  └───────────────────────────────────┼────────────────┘     │

│                                      │                      │cd build   ```

└──────────────────────────────────────┼──────────────────────┘

                                       │

                                       │ HTTP POST (multipart/form-data)


                                       ▼

                    ┌──────────────────────────────────┐cmake .. -DJUCE_PATH=../../JUCE   ```bash

                    │     ColDaw Server (Node.js)      │

                    │                                  │cmake --build . --config Release   cd vst-plugin

                    │  POST /api/auth/login            │

                    │  - Verify user credentials       │```   ./build.sh

                    │  - Return auth token             │

                    │                                  │   ```

                    │  POST /api/projects/init         │


                    │  - Parse project data            │


                    │  - Return projectId              │

                    └──────────────────┬───────────────┘- Standalone: `build/ColDaw Export_artefacts/Release/Standalone/ColDaw Export`

                                       │


                    ┌──────────────────────────────────┐


                    │                                  │


                    │  - Display project details       │


                    │  - Version history               │


```


### Core Components

```bash

#### 1. PluginProcessor (`PluginProcessor.cpp`)


**Responsibilities:**


- File system interaction (detect and monitor .als files)


- Authentication management (store and verify tokens)

- State management (login state, export state)**Windows**:




```cpp


void loginUser(String email, String password) // User login


void checkForProjectChanges()                  // Monitor file changes




#### 2. PluginEditor (`PluginEditor.cpp`)**Linux**:




- User interface rendering

- User input handlingls -la ~/.vst3/ | grep ColDaw

- Status display updates


**UI Components:**


juce::TextEditor usernameEditor;    // Username input


juce::TextButton loginButton;       // Login button


juce::TextButton chooseFileButton;  // Choose file button


juce::TextEditor serverUrlEditor;   // Server URL input


```


### File Detection Logic


Plugin uses following strategy to detect currently open Ableton Live project:


1. **Recently Modified Files**: Check recently modified .als files in Ableton Live project directory


3. **Auto-Upload**: If auto-export enabled and file changed, auto-upload


**Project Detection Path (macOS):**


~/Music/Ableton/User Library/











POST /api/auth/login





  "email": "demo@coldaw.com",

  "password": "demo123"```bash

}




**Response:**./start.sh

```json

{``````

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "user": {┌─────────────────────────────────────┐

    "id": "user-1",


    "username": "Demo User"

  }├─────────────────────────────────────┤

}







```http│  └──────────────────────────────┘  │

POST /api/projects/init


Content-Type: multipart/form-data

│  │   Select ALS File...         │  │

{


  "projectName": "My Project"


```


**Response:**


{

  "projectId": "proj-123",├─────────────────────────────────────┤

  "projectName": "My Project",


}

```│                                     │






## 🔬 Development & Debugging│  User ID:     [user@email.com   ]  │










```bash


cmake .. -DJUCE_PATH=../../JUCE -G Xcode


```


**Visual Studio (Windows)**:


cd vst-plugin\build


start ColDaw Export.sln







Set debug target in IDE to Ableton Live or standalone app:| `test@coldaw.com` | `test123` |




- Product → Scheme → Edit Scheme


- Or use Standalone version for quick testing


**Windows Visual Studio**:


- Command: `C:\ProgramData\Ableton\Live 11 Suite\Program\Ableton Live 11 Suite.exe`



### Debug Logging


Add debug output in code:


```cpp


DBG("Server response: " + responseString);





- **Xcode**: Debug Navigator → Console


- **Standalone**: Terminal/console output


### Common Development Tasks


#### Modify Default Server Address


Edit `Source/PluginProcessor.cpp`:



```cpp


serverUrl = "https://coldawlab-production.up.railway.app";


// Change to:


```


Then recompile.

vst-plugin/

#### Modify UI Styling


Edit `paint()` method in `Source/PluginEditor.cpp`:


```cpp


{


    // ... more styling code


```


#### Add New Feature Button


1. Declare button in `PluginEditor.h`:


juce::TextButton myNewButton;

``````




```cpp


myNewButton.setButtonText("My Button");


```

   ```**ColDawExportProcessor**

3. Set position in `resized()`:


myNewButton.setBounds(20, 300, 360, 40);










### Common Issues**ColDawExportEditor**







- Confirm plugin successfully copied to correct directory


- Manually scan plugin directory in DAW

- Check plugin file permissions```




```bash

# Remove quarantine attribute```

xattr -dr com.apple.quarantine ~/Library/Audio/Plug-Ins/VST3/ColDaw\ Export.vst3







**Possible Causes:**```

- Server not running


- Network connection issue

- Incorrect credentialsContent-Type: multipart/form-data




1. Check if server running: visit `http://localhost:3001` or production URL

2. Verify server address configurationParameters:

3. Check firewall settings








- Not logged in


- File too large




**Solution Steps:**Response:

1. Confirm successful login

2. Re-save project in Ableton Live```{

3. Check file size (recommend < 100MB)

4. View plugin status message for detailed error┌─────────────────────────────────────────────────────────────┐  "projectId": "uuid",



#### 4. Auto-Export Not Working│                     Ableton Live                             │  "versionId": "uuid",



**Possible Causes:**│  ┌────────────────────────────────────────────────────┐     │  "message": "Project initialized successfully"

- "Auto Export on Save" not checked

- File path detection error│  │           ColDaw Export Plugin (VST3)              │     │}

- Permission issue

│  │                                                     │     │```

**Solution Steps:**

1. Confirm auto-export toggle checked│  │  ┌──────────────┐         ┌──────────────┐        │     │

2. Manually save project to trigger detection


4. Try manual file selection to rule out path issues

│  │  │              │         │              │        │     │

#### 5. Compilation Errors


**JUCE Path Not Found:**


CMake Error: Could not find JUCE





```bash


ls ../JUCE


# Or explicitly specify path


```


**C++ Version Not Supported:**

```└──────────────────────────────────────┼──────────────────────┘

error: C++17 features required




**Solution:**                                       │ HTTP POST (multipart/form-data)

- macOS: Update Xcode Command Line Tools

- Windows: Use Visual Studio 2019+                                       │MIT License

- Linux: Update GCC to 9+

                                       ▼

### Getting Help


If issue still unresolved:

                    │     ColDaw Server (Node.js)      │

1. **Check Logs**: Inspect DAW console output and plugin status messages


3. **Check Server**: Directly test server API endpoints

4. **Submit Issue**: Create Issue in GitHub repo, including:                    │  POST /api/auth/login            │

   - System info (OS, DAW version)


   - Reproduction steps


---

                    │                                  │- GitHub: https://github.com/yourusername/coldaw

## 📚 Related Documentation

                    │  POST /api/projects/init         │- Email: your.email@example.com

- [ColDaw Main Documentation](../README.md) - Complete project documentation





                    └──────────────────┬───────────────┘

## 🔄 Changelog                                       │

                                       ▼

### v1.0.0 (Current)                    ┌──────────────────────────────────┐

- ✅ Basic export functionality                    │   ColDaw Web Client (React)      │

- ✅ User authentication system                    │                                  │

- ✅ Auto file detection                    │  /project/{projectId}            │




                    └──────────────────────────────────┘

### Planned Features```

- [ ] Project metadata editing


- [ ] Upload progress display

- [ ] Offline queue#### 1. PluginProcessor (`PluginProcessor.cpp`)

- [ ] Multi-server configuration






```cpp
```

#### 2. PluginEditor (`PluginEditor.cpp`)


```cpp
```




```
~/Music/Ableton/User Library/
```



```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@coldaw.com",
  "password": "demo123"
}
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "email": "demo@coldaw.com",
    "username": "Demo User"
  }
}
```


```http
POST /api/projects/init
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary .als file>,
  "projectName": "My Project"
}
```

```json
{
  "projectId": "proj-123",
  "projectName": "My Project",
  "url": "https://coldawlab-production.up.railway.app/project/proj-123"
}
```

---




**Xcode (macOS)**:
```bash
cd vst-plugin/build
cmake .. -DJUCE_PATH=../../JUCE -G Xcode
open ColDaw\ Export.xcodeproj
```

**Visual Studio (Windows)**:
```powershell
cd vst-plugin\build
cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"
start ColDaw Export.sln
```



**macOS Xcode**:
- Product → Scheme → Edit Scheme
- Run → Executable: `/Applications/Ableton Live 11 Suite.app`

**Windows Visual Studio**:
- Debug → Properties → Debugging
- Command: `C:\ProgramData\Ableton\Live 11 Suite\Program\Ableton Live 11 Suite.exe`



```cpp
DBG("Upload started for file: " + alsFile.getFullPathName());
DBG("Server response: " + responseString);
```

- **Xcode**: Debug Navigator → Console
- **Visual Studio**: Output Window




```cpp
serverUrl = "https://coldawlab-production.up.railway.app";

serverUrl = "http://localhost:3001";
```




```cpp
void ColDawExportAudioProcessorEditor::paint(juce::Graphics& g)
{
}
```


```cpp
juce::TextButton myNewButton;
```

```cpp
addAndMakeVisible(myNewButton);
myNewButton.setButtonText("My Button");
myNewButton.onClick = [this] { handleMyButton(); };
```

```cpp
myNewButton.setBounds(20, 300, 360, 40);
```

---





```bash
xattr -dr com.apple.quarantine ~/Library/Audio/Plug-Ins/VST3/ColDaw\ Export.vst3
```











```bash
CMake Error: Could not find JUCE
```

```bash
ls ../JUCE

cmake .. -DJUCE_PATH=/path/to/JUCE
```

```
error: C++17 features required
```





---



---




---

