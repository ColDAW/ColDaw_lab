#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
ColDawExportEditor::ColDawExportEditor (ColDawExportProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    // Set size - compact interface
    setSize (400, 550);
    
    // Title - uppercase, minimal
    addAndMakeVisible(titleLabel);
    titleLabel.setText("ColDAW", juce::dontSendNotification);
    titleLabel.setFont(juce::FontOptions(16.0f, juce::Font::bold));
    titleLabel.setColour(juce::Label::textColourId, textPrimary);
    titleLabel.setJustificationType(juce::Justification::centredLeft);
    
    // Login status
    addAndMakeVisible(loginStatusLabel);
    loginStatusLabel.setText("NOT LOGGED IN", juce::dontSendNotification);
    loginStatusLabel.setFont(juce::FontOptions(10.0f));
    loginStatusLabel.setColour(juce::Label::textColourId, accentOrange);
    loginStatusLabel.setJustificationType(juce::Justification::centredLeft);
    
    // Username
    addAndMakeVisible(usernameLabel);
    usernameLabel.setText("EMAIL", juce::dontSendNotification);
    usernameLabel.setFont(juce::FontOptions(10.0f, juce::Font::bold));
    usernameLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(usernameEditor);
    usernameEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    usernameEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    usernameEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    usernameEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentOrange);
    usernameEditor.setBorder(juce::BorderSize<int>(1));
    usernameEditor.setFont(juce::FontOptions(12.0f));
    usernameEditor.addListener(this);
    
    // Password
    addAndMakeVisible(passwordLabel);
    passwordLabel.setText("PASSWORD", juce::dontSendNotification);
    passwordLabel.setFont(juce::FontOptions(10.0f, juce::Font::bold));
    passwordLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(passwordEditor);
    passwordEditor.setPasswordCharacter('*');
    passwordEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    passwordEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    passwordEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    passwordEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentOrange);
    passwordEditor.setBorder(juce::BorderSize<int>(1));
    passwordEditor.setFont(juce::FontOptions(12.0f));
    passwordEditor.addListener(this);
    
    // Login button - minimal style
    addAndMakeVisible(loginButton);
    loginButton.setButtonText("LOGIN");
    loginButton.addListener(this);
    loginButton.setColour(juce::TextButton::buttonColourId, bgSecondary);
    loginButton.setColour(juce::TextButton::buttonOnColourId, accentOrange);
    loginButton.setColour(juce::TextButton::textColourOffId, textPrimary);
    loginButton.setColour(juce::TextButton::textColourOnId, bgPrimary);
    
    // Logout button
    addAndMakeVisible(logoutButton);
    logoutButton.setButtonText("LOGOUT");
    logoutButton.addListener(this);
    logoutButton.setColour(juce::TextButton::buttonColourId, bgSecondary);
    logoutButton.setColour(juce::TextButton::textColourOffId, textSecondary);
    logoutButton.setVisible(false);
    
    // Select file button - first
    addAndMakeVisible(selectFileButton);
    selectFileButton.setButtonText("SELECT FILE");
    selectFileButton.addListener(this);
    selectFileButton.setColour(juce::TextButton::buttonColourId, bgSecondary);
    selectFileButton.setColour(juce::TextButton::textColourOffId, textPrimary);
    
    // Use detected file button - shown when file is detected
    addAndMakeVisible(useDetectedButton);
    useDetectedButton.setButtonText("USE DETECTED FILE");
    useDetectedButton.addListener(this);
    useDetectedButton.setColour(juce::TextButton::buttonColourId, accentOrange.darker(0.3f));
    useDetectedButton.setColour(juce::TextButton::textColourOffId, textPrimary);
    useDetectedButton.setVisible(false);
    
    // Export button - prominent orange, second
    addAndMakeVisible(exportButton);
    exportButton.setButtonText("EXPORT TO ColDAW");
    exportButton.addListener(this);
    exportButton.setColour(juce::TextButton::buttonColourId, accentOrange);
    exportButton.setColour(juce::TextButton::textColourOffId, bgPrimary);
    exportButton.setColour(juce::TextButton::buttonOnColourId, accentOrange.brighter(0.2f));
    exportButton.setEnabled(false);
    
    // Auto-export toggle
    addAndMakeVisible(autoExportToggle);
    autoExportToggle.setButtonText("AUTO-EXPORT ON SAVE");
    autoExportToggle.addListener(this);
    autoExportToggle.setToggleState(audioProcessor.getAutoExport(), juce::dontSendNotification);
    autoExportToggle.setColour(juce::ToggleButton::textColourId, textSecondary);
    autoExportToggle.setColour(juce::ToggleButton::tickColourId, accentOrange);
    
    // Status label
    addAndMakeVisible(statusLabel);
    statusLabel.setText(audioProcessor.getStatusMessage(), juce::dontSendNotification);
    statusLabel.setFont(juce::FontOptions(10.0f));
    statusLabel.setColour(juce::Label::textColourId, accentOrange);
    statusLabel.setJustificationType(juce::Justification::centred);
    
    // Current file
    addAndMakeVisible(currentFileLabel);
    currentFileLabel.setText("PROJECT", juce::dontSendNotification);
    currentFileLabel.setFont(juce::FontOptions(10.0f, juce::Font::bold));
    currentFileLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(currentFileValue);
    currentFileValue.setText("NONE", juce::dontSendNotification);
    currentFileValue.setFont(juce::FontOptions(11.0f));
    currentFileValue.setColour(juce::Label::textColourId, textPrimary);
    
    // Project Path
    addAndMakeVisible(projectPathLabel);
    projectPathLabel.setText("PROJECT PATH", juce::dontSendNotification);
    projectPathLabel.setFont(juce::FontOptions(10.0f, juce::Font::bold));
    projectPathLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(projectPathEditor);
    projectPathEditor.setText(audioProcessor.getProjectPath());
    projectPathEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    projectPathEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    projectPathEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    projectPathEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentOrange);
    projectPathEditor.setBorder(juce::BorderSize<int>(1));
    projectPathEditor.setFont(juce::FontOptions(12.0f));
    projectPathEditor.addListener(this);
    
    // User ID
    addAndMakeVisible(userIdLabel);
    userIdLabel.setText("USER ID", juce::dontSendNotification);
    userIdLabel.setFont(juce::FontOptions(10.0f, juce::Font::bold));
    userIdLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(userIdEditor);
    userIdEditor.setText(audioProcessor.getUserId());
    userIdEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    userIdEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    userIdEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    userIdEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentOrange);
    userIdEditor.setBorder(juce::BorderSize<int>(1));
    userIdEditor.setFont(juce::FontOptions(12.0f));
    userIdEditor.addListener(this);
    
    // Author
    addAndMakeVisible(authorLabel);
    authorLabel.setText("AUTHOR", juce::dontSendNotification);
    authorLabel.setFont(juce::FontOptions(10.0f, juce::Font::bold));
    authorLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(authorEditor);
    authorEditor.setText(audioProcessor.getAuthor());
    authorEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    authorEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    authorEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    authorEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentOrange);
    authorEditor.setBorder(juce::BorderSize<int>(1));
    authorEditor.setFont(juce::FontOptions(12.0f));
    authorEditor.addListener(this);
    
    // Start timer to update status
    startTimer(500);
}

ColDawExportEditor::~ColDawExportEditor()
{
    stopTimer();
}

//==============================================================================
void ColDawExportEditor::paint (juce::Graphics& g)
{
    // Deep black background - teenage engineering style
    g.fillAll(bgPrimary);
    
    // Subtle section dividers
    g.setColour(borderColor);
    g.drawHorizontalLine(120, 0, getWidth());  // Below title
    g.drawHorizontalLine(280, 0, getWidth());  // Below login section
}

void ColDawExportEditor::resized()
{
    auto area = getLocalBounds().reduced(20);
    int margin = 12;  // Tight teenage engineering spacing
    
    // Title section - compact
    titleLabel.setBounds(area.removeFromTop(24));
    area.removeFromTop(4);
    loginStatusLabel.setBounds(area.removeFromTop(16));
    area.removeFromTop(20);
    
    // Login section
    usernameLabel.setBounds(area.removeFromTop(14));
    area.removeFromTop(4);
    usernameEditor.setBounds(area.removeFromTop(28));
    area.removeFromTop(margin);
    
    passwordLabel.setBounds(area.removeFromTop(14));
    area.removeFromTop(4);
    passwordEditor.setBounds(area.removeFromTop(28));
    area.removeFromTop(margin);
    
    auto buttonRow = area.removeFromTop(32);
    loginButton.setBounds(buttonRow.removeFromLeft(180));
    buttonRow.removeFromLeft(8);
    logoutButton.setBounds(buttonRow);
    area.removeFromTop(20);
    
    // Project Path - above select file button
    projectPathLabel.setBounds(area.removeFromTop(14));
    area.removeFromTop(4);
    projectPathEditor.setBounds(area.removeFromTop(28));
    area.removeFromTop(margin);
    
    // Action buttons
    selectFileButton.setBounds(area.removeFromTop(28));
    area.removeFromTop(margin);
    
    // Use detected button (conditionally shown)
    if (useDetectedButton.isVisible())
    {
        useDetectedButton.setBounds(area.removeFromTop(28));
        area.removeFromTop(margin);
    }
    
    exportButton.setBounds(area.removeFromTop(36));  // Larger export button
    area.removeFromTop(margin);
    
    autoExportToggle.setBounds(area.removeFromTop(24));
    area.removeFromTop(margin);
    
    // Status
    statusLabel.setBounds(area.removeFromTop(20));
    area.removeFromTop(margin);
    
    // Current file
    currentFileLabel.setBounds(area.removeFromTop(14));
    area.removeFromTop(4);
    currentFileValue.setBounds(area.removeFromTop(20));
    area.removeFromTop(margin);
    
    // User ID
    userIdLabel.setBounds(area.removeFromTop(14));
    area.removeFromTop(4);
    userIdEditor.setBounds(area.removeFromTop(28));
    area.removeFromTop(margin);
    
    // Author
    authorLabel.setBounds(area.removeFromTop(14));
    area.removeFromTop(4);
    authorEditor.setBounds(area.removeFromTop(28));
}

void ColDawExportEditor::timerCallback()
{
    // Update login status
    bool loggedIn = audioProcessor.isLoggedIn();
    exportButton.setEnabled(loggedIn);
    loginButton.setVisible(!loggedIn);
    logoutButton.setVisible(loggedIn);
    usernameEditor.setEnabled(!loggedIn);
    passwordEditor.setEnabled(!loggedIn);
    
    if (loggedIn)
    {
        loginStatusLabel.setText("LOGGED IN AS: " + audioProcessor.getUsername().toUpperCase(), juce::dontSendNotification);
        loginStatusLabel.setColour(juce::Label::textColourId, accentOrange);
    }
    else
    {
        loginStatusLabel.setText("NOT LOGGED IN", juce::dontSendNotification);
        loginStatusLabel.setColour(juce::Label::textColourId, textSecondary);
    }
    
    // Update status message
    statusLabel.setText(audioProcessor.getStatusMessage(), juce::dontSendNotification);
    
    // Show/hide "Use Detected File" button
    juce::File detectedFile = audioProcessor.getDetectedFile();
    bool hasDetectedFile = detectedFile.existsAsFile();
    bool hasCurrentFile = !audioProcessor.getCurrentProjectName().isEmpty() && 
                          audioProcessor.getCurrentProjectName() != "None";
    
    // Only show button if we have a detected file and no current file selected
    bool shouldShowButton = hasDetectedFile && !hasCurrentFile;
    if (useDetectedButton.isVisible() != shouldShowButton)
    {
        useDetectedButton.setVisible(shouldShowButton);
        resized(); // Trigger layout update
    }
    
    // Update current file display
    currentFileValue.setText(audioProcessor.getCurrentProjectName(), juce::dontSendNotification);
    
    // Update project path from processor (in case it was loaded from mapping)
    juce::String currentPath = audioProcessor.getProjectPath();
    if (projectPathEditor.getText() != currentPath)
    {
        projectPathEditor.setText(currentPath, juce::dontSendNotification);
    }
    
    // Update status color based on message - TE style
    if (audioProcessor.getStatusMessage().contains("Error") || 
        audioProcessor.getStatusMessage().contains("failed"))
        statusLabel.setColour(juce::Label::textColourId, juce::Colour(0xffff0000));  // Red for errors
    else if (audioProcessor.getStatusMessage().contains("Success"))
        statusLabel.setColour(juce::Label::textColourId, accentOrange);  // Orange for success
    else if (audioProcessor.isExporting() || 
             audioProcessor.getStatusMessage().contains("Logging in"))
        statusLabel.setColour(juce::Label::textColourId, textSecondary);  // Gray for processing
    else if (audioProcessor.getStatusMessage().contains("Detected"))
        statusLabel.setColour(juce::Label::textColourId, accentOrange.darker(0.2f));  // Muted orange
    else if (audioProcessor.getStatusMessage().contains("selected") ||
             audioProcessor.getStatusMessage().contains("Logged in"))
        statusLabel.setColour(juce::Label::textColourId, accentOrange);  // Orange for status
    else if (audioProcessor.getStatusMessage().contains("Please"))
        statusLabel.setColour(juce::Label::textColourId, juce::Colours::orange);
    else
        statusLabel.setColour(juce::Label::textColourId, juce::Colours::lightblue);
}

void ColDawExportEditor::buttonClicked (juce::Button* button)
{
    if (button == &loginButton)
    {
        // 执行登录
        auto username = usernameEditor.getText();
        auto password = passwordEditor.getText();
        
        if (username.isEmpty() || password.isEmpty())
        {
            // 状态会通过 processor 更新
            return;
        }
        
        audioProcessor.login(username, password);
        // 清空密码框以保护安全
        passwordEditor.setText("");
    }
    else if (button == &logoutButton)
    {
        // 执行登出
        audioProcessor.logout();
    }
    else if (button == &useDetectedButton)
    {
        // Use the auto-detected file
        audioProcessor.useDetectedFile();
    }
    else if (button == &exportButton)
    {
        audioProcessor.exportToColDaw();
    }
    else if (button == &selectFileButton)
    {
        // File chooser
        auto chooser = std::make_shared<juce::FileChooser>(
            "Select Ableton Live Project",
            juce::File::getSpecialLocation(juce::File::userDocumentsDirectory),
            "*.als"
        );
        
        auto flags = juce::FileBrowserComponent::openMode | juce::FileBrowserComponent::canSelectFiles;
        
        chooser->launchAsync(flags, [this, chooser](const juce::FileChooser& fc)
        {
            auto file = fc.getResult();
            if (file.existsAsFile())
            {
                audioProcessor.setCurrentProjectFile(file);
            }
        });
    }
    else if (button == &autoExportToggle)
    {
        audioProcessor.setAutoExport(autoExportToggle.getToggleState());
    }
}

void ColDawExportEditor::textEditorTextChanged (juce::TextEditor& editor)
{
    if (&editor == &projectPathEditor)
    {
        audioProcessor.setProjectPath(editor.getText());
    }
    else if (&editor == &userIdEditor)
    {
        audioProcessor.setUserId(editor.getText());
    }
    else if (&editor == &authorEditor)
    {
        audioProcessor.setAuthor(editor.getText());
    }
}

void ColDawExportEditor::labelTextChanged (juce::Label* label)
{
    // Not used, but required by Label::Listener interface
}
