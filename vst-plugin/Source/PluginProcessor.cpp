#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
ColDawExportProcessor::ColDawExportProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     #if ! JucePlugin_IsMidiEffect
                      #if ! JucePlugin_IsSynth
                       .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                      #endif
                       .withOutput ("Output", juce::AudioChannelSet::stereo(), true)
                     #endif
                       )
#endif
{
    // Initialize defaults - production URL
    serverUrl = "https://www.coldaw.app";
    userId = "default_user";
    author = "Ableton User";
    autoExport = false;
    exporting = false;
    fileWatcherActive = false;
    statusMessage = "Please login to continue";
    username = "";
    authToken = "";
    currentUserId = "";
    
    // Load saved project path mappings
    loadProjectMapping();
    
    // Start file watcher
    startTimer(2000); // Check every 2 seconds
    
    // Immediately detect the most recently modified .als file on startup
    detectCurrentProject();
}

//==============================================================================
void ColDawExportProcessor::login(const juce::String& user, const juce::String& password)
{
    if (user.isEmpty() || password.isEmpty())
    {
        statusMessage = "Error: Username and password required";
        return;
    }
    
    statusMessage = "Logging in...";
    
    // Prepare login request
    juce::URL url(serverUrl + "/api/auth/login");
    
    // Create JSON body
    juce::var jsonBody = new juce::DynamicObject();
    jsonBody.getDynamicObject()->setProperty("email", user);
    jsonBody.getDynamicObject()->setProperty("password", password);
    
    juce::String jsonString = juce::JSON::toString(jsonBody);
    
    // Create input stream with headers
    juce::StringPairArray responseHeaders;
    int statusCode = 0;
    
    // IMPORTANT: For JSON POST, we need to properly set Content-Type
    // Create URL with POST data
    juce::URL postUrl = url.withPOSTData(jsonString);
    
    // Use InputStreamOptions to set proper headers
    juce::URL::InputStreamOptions options = juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
        .withConnectionTimeoutMs(10000)
        .withResponseHeaders(&responseHeaders)
        .withStatusCode(&statusCode)
        .withExtraHeaders("Content-Type: application/json\r\nContent-Length: " + juce::String(jsonString.length()))
        .withHttpRequestCmd("POST");
    
    std::unique_ptr<juce::InputStream> stream(
        postUrl.createInputStream(options)
    );
    
    if (stream != nullptr)
    {
        juce::String response = stream->readEntireStreamAsString();
        
        if (statusCode >= 200 && statusCode < 300)
        {
            // Success - parse token
            auto json = juce::JSON::parse(response);
            if (auto* obj = json.getDynamicObject())
            {
                if (obj->hasProperty("token") && obj->hasProperty("userId"))
                {
                    authToken = obj->getProperty("token").toString();
                    currentUserId = obj->getProperty("userId").toString();
                    username = user;
                    
                    statusMessage = "Logged in as: " + username;
                }
                else if (obj->hasProperty("error"))
                {
                    statusMessage = "Login failed: " + obj->getProperty("error").toString();
                }
                else
                {
                    statusMessage = "Login failed: Invalid response";
                }
            }
        }
        else if (statusCode == 401)
        {
            // Authentication failed - parse error message
            auto json = juce::JSON::parse(response);
            if (auto* obj = json.getDynamicObject())
            {
                if (obj->hasProperty("error"))
                {
                    statusMessage = "Login failed: " + obj->getProperty("error").toString();
                }
                else
                {
                    statusMessage = "Login failed: Invalid email or password";
                }
            }
            else
            {
                statusMessage = "Login failed: Invalid email or password";
            }
        }
        else
        {
            // Other error
            statusMessage = "Login failed: Server error (Status: " + juce::String(statusCode) + ")";
        }
    }
    else
    {
        statusMessage = "Login failed: Could not connect to server";
    }
}

void ColDawExportProcessor::logout()
{
    username = "";
    authToken = "";
    currentUserId = "";
    statusMessage = "Logged out. Please login to continue";
}

void ColDawExportProcessor::exportToColDaw()
{
    if (!isLoggedIn())
    {
        statusMessage = "Error: Please login first";
        return;
    }
    
    if (exporting)
    {
        statusMessage = "Export already in progress...";
        return;
    }
    
    // First, try to use the manually selected file
    if (currentProjectFile.existsAsFile())
    {
        statusMessage = "Exporting selected project to ColDaw...";
        uploadProjectFile(currentProjectFile);
        return;
    }
    
    // Otherwise, try to detect recently saved file
    juce::File abletonProjectsDir = juce::File::getSpecialLocation(
        juce::File::userMusicDirectory).getChildFile("Ableton");
    
    if (!abletonProjectsDir.exists())
    {
        statusMessage = "Error: Ableton folder not found. Please select a file manually.";
        return;
    }
    
    // Find the most recently modified .als file (within last 5 minutes)
    juce::File mostRecentFile;
    juce::Time mostRecentTime;
    juce::Time fiveMinutesAgo = juce::Time::getCurrentTime() - juce::RelativeTime::minutes(5);
    
    findMostRecentALSFile(abletonProjectsDir, mostRecentFile, mostRecentTime, fiveMinutesAgo);
    
    if (mostRecentFile.existsAsFile())
    {
        statusMessage = "Detected recent file: " + mostRecentFile.getFileName();
        currentProjectFile = mostRecentFile;
        uploadProjectFile(mostRecentFile);
    }
    else
    {
        statusMessage = "No recently saved project found. Please select a file manually.";
    }
}

ColDawExportProcessor::~ColDawExportProcessor()
{
    stopTimer();
}

//==============================================================================
const juce::String ColDawExportProcessor::getName() const
{
    return JucePlugin_Name;
}

bool ColDawExportProcessor::acceptsMidi() const
{
   #if JucePlugin_WantsMidiInput
    return true;
   #else
    return false;
   #endif
}

bool ColDawExportProcessor::producesMidi() const
{
   #if JucePlugin_ProducesMidiOutput
    return true;
   #else
    return false;
   #endif
}

bool ColDawExportProcessor::isMidiEffect() const
{
   #if JucePlugin_IsMidiEffect
    return true;
   #else
    return false;
   #endif
}

double ColDawExportProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

int ColDawExportProcessor::getNumPrograms()
{
    return 1;
}

int ColDawExportProcessor::getCurrentProgram()
{
    return 0;
}

void ColDawExportProcessor::setCurrentProgram (int index)
{
}

const juce::String ColDawExportProcessor::getProgramName (int index)
{
    return {};
}

void ColDawExportProcessor::changeProgramName (int index, const juce::String& newName)
{
}

//==============================================================================
void ColDawExportProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{
}

void ColDawExportProcessor::releaseResources()
{
}

#ifndef JucePlugin_PreferredChannelConfigurations
bool ColDawExportProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
  #if JucePlugin_IsMidiEffect
    juce::ignoreUnused (layouts);
    return true;
  #else
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
     && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

   #if ! JucePlugin_IsSynth
    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;
   #endif

    return true;
  #endif
}
#endif

void ColDawExportProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    auto totalNumInputChannels  = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear (i, 0, buffer.getNumSamples());

    // Pass through audio
    for (int channel = 0; channel < totalNumInputChannels; ++channel)
    {
        auto* channelData = buffer.getWritePointer (channel);
        // Plugin doesn't process audio, just passes it through
    }
}

//==============================================================================
bool ColDawExportProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* ColDawExportProcessor::createEditor()
{
    return new ColDawExportEditor (*this);
}

//==============================================================================
void ColDawExportProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    // Save settings
    std::unique_ptr<juce::XmlElement> xml (new juce::XmlElement ("ColDawExportSettings"));
    
    xml->setAttribute ("serverUrl", serverUrl);
    xml->setAttribute ("userId", userId);
    xml->setAttribute ("author", author);
    xml->setAttribute ("autoExport", autoExport);
    xml->setAttribute ("username", username);
    xml->setAttribute ("authToken", authToken);
    xml->setAttribute ("currentUserId", currentUserId);
    
    copyXmlToBinary (*xml, destData);
}

void ColDawExportProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    // Load settings
    std::unique_ptr<juce::XmlElement> xmlState (getXmlFromBinary (data, sizeInBytes));
    
    if (xmlState.get() != nullptr)
    {
        if (xmlState->hasTagName ("ColDawExportSettings"))
        {
            serverUrl = xmlState->getStringAttribute ("serverUrl", serverUrl);
            userId = xmlState->getStringAttribute ("userId", userId);
            author = xmlState->getStringAttribute ("author", author);
            autoExport = xmlState->getBoolAttribute ("autoExport", autoExport);
            username = xmlState->getStringAttribute ("username", username);
            authToken = xmlState->getStringAttribute ("authToken", authToken);
            currentUserId = xmlState->getStringAttribute ("currentUserId", currentUserId);
        }
    }
}

//==============================================================================
// Helper function to recursively find most recent .als file
void ColDawExportProcessor::findMostRecentALSFile(const juce::File& directory, 
                                                    juce::File& mostRecentFile, 
                                                    juce::Time& mostRecentTime,
                                                    const juce::Time& minimumTime)
{
    juce::Array<juce::File> alsFiles;
    directory.findChildFiles(alsFiles, juce::File::findFiles, true, "*.als");
    
    for (auto& file : alsFiles)
    {
        auto modTime = file.getLastModificationTime();
        
        // Only consider files modified after minimumTime
        if (modTime > minimumTime && modTime > mostRecentTime)
        {
            mostRecentFile = file;
            mostRecentTime = modTime;
        }
    }
}

void ColDawExportProcessor::uploadProjectFile(const juce::File& alsFile)
{
    if (!alsFile.existsAsFile())
    {
        statusMessage = "Error: File does not exist";
        exporting = false;
        return;
    }
    
    // Read file data
    juce::MemoryBlock fileData;
    if (!alsFile.loadFileAsData(fileData))
    {
        statusMessage = "Error: Could not read file";
        exporting = false;
        return;
    }
    
    // Create multipart form data with proper binary handling
    juce::String boundary = "----WebKitFormBoundary" + juce::String::toHexString(juce::Random::getSystemRandom().nextInt64());
    
    juce::MemoryOutputStream postData;
    
    // Add form fields
    auto addFormField = [&](const juce::String& name, const juce::String& value)
    {
        postData << "--" << boundary << "\r\n";
        postData << "Content-Disposition: form-data; name=\"" << name << "\"\r\n\r\n";
        postData << value << "\r\n";
    };
    
    addFormField("projectName", alsFile.getFileNameWithoutExtension());
    addFormField("author", username.isNotEmpty() ? username : author);
    addFormField("message", "Update from VST plugin - " + juce::Time::getCurrentTime().toString(true, true));
    
    // Add file data
    postData << "--" << boundary << "\r\n";
    postData << "Content-Disposition: form-data; name=\"alsFile\"; filename=\"" << alsFile.getFileName() << "\"\r\n";
    postData << "Content-Type: application/octet-stream\r\n\r\n";
    
    // Write binary file data
    postData.write(fileData.getData(), fileData.getSize());
    
    // End of file part
    postData << "\r\n";
    
    // Final boundary
    postData << "--" << boundary << "--\r\n";
    
    // Get the complete multipart data
    juce::MemoryBlock completePostData = postData.getMemoryBlock();
    
    // Save the project path mapping if projectPath is set
    if (!projectPath.isEmpty() && alsFile.existsAsFile())
    {
        juce::String fileKey = alsFile.getFullPathName();
        filePathMapping[fileKey] = projectPath;
        saveProjectMapping();
    }
    
    // Prepare headers with authentication
    juce::String contentType = "multipart/form-data; boundary=" + boundary;
    juce::String extraHeaders = "Content-Type: " + contentType;
    if (authToken.isNotEmpty())
    {
        extraHeaders += "\r\nAuthorization: Bearer " + authToken;
    }
    
    // Create URL for POST request - use smart-import endpoint
    juce::URL uploadUrl(serverUrl + "/api/projects/smart-import");
    
    // Create URL with POST data
    juce::URL postUrl = uploadUrl.withPOSTData(completePostData);
    
    // Create input stream with headers
    juce::StringPairArray responseHeaders;
    int statusCode = 0;
    
    // Use InputStreamOptions for proper headers
    juce::URL::InputStreamOptions options = juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
        .withConnectionTimeoutMs(30000)
        .withResponseHeaders(&responseHeaders)
        .withStatusCode(&statusCode)
        .withExtraHeaders(extraHeaders)
        .withHttpRequestCmd("POST");
    
    std::unique_ptr<juce::InputStream> stream(
        postUrl.createInputStream(options)
    );
    
    if (stream != nullptr)
    {
        juce::String response = stream->readEntireStreamAsString();
        
        if (statusCode >= 200 && statusCode < 300)
        {
            // Parse JSON response
            auto json = juce::JSON::parse(response);
            if (auto* obj = json.getDynamicObject())
            {
                if (obj->hasProperty("projectId"))
                {
                    juce::String projectId = obj->getProperty("projectId").toString();
                    bool isNewProject = obj->hasProperty("isNewProject") && 
                                       obj->getProperty("isNewProject").toString() == "true";
                    bool hasPendingChanges = obj->hasProperty("hasPendingChanges") &&
                                            obj->getProperty("hasPendingChanges");
                    
                    if (isNewProject)
                    {
                        statusMessage = "New project created! Project ID: " + projectId;
                    }
                    else if (hasPendingChanges)
                    {
                        statusMessage = "Project updated! Pending changes ready to push.";
                    }
                    else
                    {
                        statusMessage = "New version added to existing project! ID: " + projectId;
                    }
                    
                    // Open in browser with VST import flag
                    openProjectInBrowser(projectId, hasPendingChanges);
                }
                else if (obj->hasProperty("error"))
                {
                    statusMessage = "Error: " + obj->getProperty("error").toString();
                }
                else
                {
                    statusMessage = "Error: Invalid server response";
                }
            }
        }
        else if (statusCode == 401)
        {
            statusMessage = "Error: Authentication failed. Please login again.";
        }
        else
        {
            statusMessage = "Error: Upload failed (Status: " + juce::String(statusCode) + ")";
        }
    }
    else
    {
        statusMessage = "Error: Could not connect to server";
    }
    
    exporting = false;
}

void ColDawExportProcessor::openProjectInBrowser(const juce::String& projectId, bool fromVST)
{
    // Use the same base URL as server (frontend is served from same domain in production)
    juce::String webUrl = serverUrl;
    
    // Remove /api suffix if present and construct project URL
    if (webUrl.contains("/api"))
    {
        webUrl = webUrl.upToFirstOccurrenceOf("/api", false, true);
    }
    
    // In production, frontend and backend share the same domain
    // In development with separate ports, this should be configured
    webUrl += "/project/" + projectId;
    
    if (fromVST)
    {
        webUrl += "?from=vst";
    }
    
    juce::URL url(webUrl);
    url.launchInDefaultBrowser();
}

void ColDawExportProcessor::timerCallback()
{
    if (!autoExport || exporting)
        return;
    
    // Auto-detect if no file is manually selected
    if (!currentProjectFile.existsAsFile())
    {
        juce::File abletonProjectsDir = juce::File::getSpecialLocation(
            juce::File::userMusicDirectory).getChildFile("Ableton");
        
        if (abletonProjectsDir.exists())
        {
            juce::File mostRecentFile;
            juce::Time mostRecentTime;
            juce::Time fiveMinutesAgo = juce::Time::getCurrentTime() - juce::RelativeTime::minutes(5);
            
            findMostRecentALSFile(abletonProjectsDir, mostRecentFile, mostRecentTime, fiveMinutesAgo);
            
            if (mostRecentFile.existsAsFile())
            {
                currentProjectFile = mostRecentFile;
                lastModificationTime = mostRecentTime;
            }
        }
    }
    
    if (currentProjectFile.existsAsFile())
    {
        auto currentModTime = currentProjectFile.getLastModificationTime();
        
        if (currentModTime > lastModificationTime)
        {
            // File has been modified, auto-export
            lastModificationTime = currentModTime;
            statusMessage = "Detected project save, auto-exporting...";
            
            // Wait a bit to ensure file is fully saved
            juce::Thread::sleep(500);
            
            exportToColDaw();
        }
    }
}

void ColDawExportProcessor::detectCurrentProject()
{
    juce::File abletonProjectsDir = juce::File::getSpecialLocation(
        juce::File::userMusicDirectory).getChildFile("Ableton");
    
    if (!abletonProjectsDir.exists())
        return;
    
    // Look for recently modified files (within last 30 minutes for initial detection)
    juce::File mostRecentFile;
    juce::Time mostRecentTime;
    juce::Time thirtyMinutesAgo = juce::Time::getCurrentTime() - juce::RelativeTime::minutes(30);
    
    findMostRecentALSFile(abletonProjectsDir, mostRecentFile, mostRecentTime, thirtyMinutesAgo);
    
    if (mostRecentFile.existsAsFile())
    {
        detectedProjectFile = mostRecentFile;
        statusMessage = "Detected: " + mostRecentFile.getFileNameWithoutExtension() + " (click to use)";
    }
}

void ColDawExportProcessor::useDetectedFile()
{
    if (detectedProjectFile.existsAsFile())
    {
        setCurrentProjectFile(detectedProjectFile);
        statusMessage = "Using: " + detectedProjectFile.getFileNameWithoutExtension();
    }
}

void ColDawExportProcessor::startFileWatcher()
{
    fileWatcherActive = true;
}

void ColDawExportProcessor::stopFileWatcher()
{
    fileWatcherActive = false;
}

void ColDawExportProcessor::loadProjectMapping()
{
    // Load project path mappings from a JSON file
    juce::File mappingFile = juce::File::getSpecialLocation(
        juce::File::userApplicationDataDirectory)
        .getChildFile("ColDaw")
        .getChildFile("project_mappings.json");
    
    if (mappingFile.existsAsFile())
    {
        juce::String jsonText = mappingFile.loadFileAsString();
        juce::var jsonData = juce::JSON::parse(jsonText);
        
        if (jsonData.isObject())
        {
            juce::DynamicObject* obj = jsonData.getDynamicObject();
            if (obj != nullptr)
            {
                for (auto& prop : obj->getProperties())
                {
                    filePathMapping[prop.name.toString()] = prop.value.toString();
                }
            }
        }
    }
}

void ColDawExportProcessor::saveProjectMapping()
{
    // Save project path mappings to a JSON file
    juce::File mappingFile = juce::File::getSpecialLocation(
        juce::File::userApplicationDataDirectory)
        .getChildFile("ColDaw")
        .getChildFile("project_mappings.json");
    
    mappingFile.getParentDirectory().createDirectory();
    
    juce::var jsonData = new juce::DynamicObject();
    juce::DynamicObject* obj = jsonData.getDynamicObject();
    
    for (auto& pair : filePathMapping)
    {
        obj->setProperty(pair.first, pair.second);
    }
    
    juce::String jsonText = juce::JSON::toString(jsonData, true);
    mappingFile.replaceWithText(jsonText);
}

void ColDawExportProcessor::setCurrentProjectFile(const juce::File& file)
{
    if (file.existsAsFile() && file.hasFileExtension(".als"))
    {
        // Generate a unique key for this file (using file path hash)
        juce::String fileKey = file.getFullPathName();
        
        // Load remembered project path for this file
        if (filePathMapping.find(fileKey) != filePathMapping.end())
        {
            projectPath = filePathMapping[fileKey];
        }
        else
        {
            projectPath = "";  // Clear if no mapping exists
        }
        currentProjectFile = file;
        lastModificationTime = file.getLastModificationTime();
        statusMessage = "File selected: " + file.getFileNameWithoutExtension();
    }
}

//==============================================================================
// This creates new instances of the plugin
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new ColDawExportProcessor();
}
