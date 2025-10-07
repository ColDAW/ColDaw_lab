#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include <map>

//==============================================================================
/**
 * ColDaw Export Plugin - Audio Processor
 * 
 * This plugin allows users to export their Ableton Live projects to ColDaw
 * with a single click. It monitors the current project file and uploads it
 * to the ColDaw server.
 */
class ColDawExportProcessor : public juce::AudioProcessor,
                                public juce::Timer
{
public:
    //==============================================================================
    ColDawExportProcessor();
    ~ColDawExportProcessor() override;

    //==============================================================================
    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

   #ifndef JucePlugin_PreferredChannelConfigurations
    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;
   #endif

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    //==============================================================================
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    //==============================================================================
    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    //==============================================================================
    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    //==============================================================================
    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    //==============================================================================
    // Custom methods for ColDaw export
    void exportToColDaw();
    void startFileWatcher();
    void stopFileWatcher();
    void timerCallback() override;
    void setCurrentProjectFile(const juce::File& file);
    void detectCurrentProject();
    
    juce::String getStatusMessage() const { return statusMessage; }
    juce::String getCurrentProjectName() const { 
        return currentProjectFile.existsAsFile() ? 
               currentProjectFile.getFileNameWithoutExtension() : 
               "None"; 
    }
    bool isExporting() const { return exporting; }
    bool isLoggedIn() const { return !authToken.isEmpty(); }
    
    // Authentication
    void login(const juce::String& username, const juce::String& password);
    void logout();
    juce::String getUsername() const { return username; }
    juce::String getAuthToken() const { return authToken; }
    
    // Settings
    void setUserId(const juce::String& id) { userId = id; }
    void setAuthor(const juce::String& name) { author = name; }
    void setAutoExport(bool enable) { autoExport = enable; }
    
    juce::String getUserId() const { return userId; }
    juce::String getAuthor() const { return author; }
    bool getAutoExport() const { return autoExport; }
    
    juce::File getDetectedFile() const { return detectedProjectFile; }
    void useDetectedFile();
    
    juce::String getProjectPath() const { return projectPath; }
    void setProjectPath(const juce::String& path) { projectPath = path; saveProjectMapping(); }
    void loadProjectMapping();
    void saveProjectMapping();

private:
    //==============================================================================
    void uploadProjectFile(const juce::File& alsFile);
    void openProjectInBrowser(const juce::String& projectId, bool fromVST = false);
    
    // Helper function for finding recent .als files
    void findMostRecentALSFile(const juce::File& directory, 
                               juce::File& mostRecentFile, 
                               juce::Time& mostRecentTime,
                               const juce::Time& minimumTime);
    
    // State
    juce::String statusMessage;
    juce::File detectedProjectFile;  // Auto-detected file
    juce::String projectPath;  // User-entered project path
    std::map<juce::String, juce::String> filePathMapping;  // Maps ALS file hash to project path
    bool exporting;
    bool autoExport;
    
    // Authentication
    juce::String username;
    juce::String authToken;
    juce::String currentUserId;
    
    // Settings
    juce::String serverUrl;
    juce::String userId;
    juce::String author;
    
    // File watching
    juce::File currentProjectFile;
    juce::Time lastModificationTime;
    bool fileWatcherActive;
    
    // HTTP
    std::unique_ptr<juce::URL::DownloadTask> currentUpload;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ColDawExportProcessor)
};
