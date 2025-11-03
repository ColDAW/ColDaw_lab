#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
ColDAWLookAndFeel::ColDAWLookAndFeel()
{
    // Initialize gradient colors matching web theme
    gradientColors.add(juce::Colour(0xff89AAF8)); // rgba(137, 170, 248, 0.8)
    gradientColors.add(juce::Colour(0xffB770FC)); // rgba(183, 112, 252, 0.8)
    gradientColors.add(juce::Colour(0xffD24DC3)); // rgba(210, 77, 195, 0.8)
    gradientColors.add(juce::Colour(0xffE85560)); // rgba(232, 85, 96, 0.8)
    gradientColors.add(juce::Colour(0xffF5A193)); // rgba(245, 161, 147, 0.8)
}

void ColDAWLookAndFeel::drawButtonBackground (juce::Graphics& g,
                                            juce::Button& button,
                                            const juce::Colour&,
                                            bool shouldDrawButtonAsHighlighted,
                                            bool)
{
    auto bounds = button.getLocalBounds().toFloat();
    auto cornerSize = 6.0f; // Match web theme border-radius
    
    // Always draw transparent background
    g.setColour(juce::Colours::transparentBlack);
    g.fillRoundedRectangle(bounds, cornerSize);
    
    // Draw border
    if (shouldDrawButtonAsHighlighted)
    {
        // Create gradient border on hover        
        // Draw gradient border effect
        juce::ColourGradient gradient(gradientColors[0], bounds.getTopLeft(),
                                    gradientColors[4], bounds.getBottomRight(), false);
        
        for (int i = 1; i < gradientColors.size() - 1; ++i)
        {
            gradient.addColour(static_cast<double>(i) / (gradientColors.size() - 1), gradientColors[i]);
        }
        
        g.setGradientFill(gradient);
        g.drawRoundedRectangle(bounds, cornerSize, 2.0f);
    }
    else
    {
        // Normal border
        g.setColour(juce::Colour(0xff2a2a2a)); // borderColor
        g.drawRoundedRectangle(bounds, cornerSize, 1.0f);
    }
}

void ColDAWLookAndFeel::drawButtonText (juce::Graphics& g,
                                      juce::TextButton& button,
                                      bool shouldDrawButtonAsHighlighted,
                                      bool)
{
    auto font = juce::FontOptions(13.0f, juce::Font::plain); // Use consistent font
    g.setFont(font);
    
    auto textColour = shouldDrawButtonAsHighlighted ? 
        juce::Colour(0xffffffff) : juce::Colour(0xffb0b0b0); // textPrimary : textSecondary
    
    g.setColour(textColour);
    
    auto bounds = button.getLocalBounds();
    g.drawText(button.getButtonText(), bounds, juce::Justification::centred);
}

//==============================================================================
ColDawExportEditor::ColDawExportEditor (ColDawExportProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    // Set size - increased for better spacing
    setSize (400, 600);
    
    // Apply custom look and feel
    setLookAndFeel(&customLookAndFeel);
    
    // Title - uppercase, minimal with updated font size
    addAndMakeVisible(titleLabel);
    titleLabel.setText("ColDAW", juce::dontSendNotification);
    titleLabel.setFont(juce::FontOptions(18.0f, juce::Font::bold)); // Slightly larger
    titleLabel.setColour(juce::Label::textColourId, textPrimary);
    titleLabel.setJustificationType(juce::Justification::centredLeft);
    
    // Login status with better typography
    addAndMakeVisible(loginStatusLabel);
    loginStatusLabel.setText("NOT LOGGED IN", juce::dontSendNotification);
    loginStatusLabel.setFont(juce::FontOptions(11.0f, juce::Font::bold)); // Slightly larger
    loginStatusLabel.setColour(juce::Label::textColourId, accentPrimary);
    loginStatusLabel.setJustificationType(juce::Justification::centredLeft);
    
    // Username with consistent label styling
    addAndMakeVisible(usernameLabel);
    usernameLabel.setText("EMAIL", juce::dontSendNotification);
    usernameLabel.setFont(juce::FontOptions(11.0f, juce::Font::bold)); // Consistent with web
    usernameLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(usernameEditor);
    usernameEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    usernameEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    usernameEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    usernameEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentPrimary);
    usernameEditor.setBorder(juce::BorderSize<int>(1));
    usernameEditor.setFont(juce::FontOptions(13.0f)); // Match web font size
    usernameEditor.addListener(this);
    
    // Password with consistent styling
    addAndMakeVisible(passwordLabel);
    passwordLabel.setText("PASSWORD", juce::dontSendNotification);
    passwordLabel.setFont(juce::FontOptions(11.0f, juce::Font::bold));
    passwordLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(passwordEditor);
    passwordEditor.setPasswordCharacter('*');
    passwordEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    passwordEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    passwordEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    passwordEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentPrimary);
    passwordEditor.setBorder(juce::BorderSize<int>(1));
    passwordEditor.setFont(juce::FontOptions(13.0f)); // Match web font size
    passwordEditor.addListener(this);
    
    // Login button - updated with modern styling
    addAndMakeVisible(loginButton);
    loginButton.setButtonText("LOGIN");
    loginButton.addListener(this);
    loginButton.setColour(juce::TextButton::buttonColourId, juce::Colours::transparentBlack);
    loginButton.setColour(juce::TextButton::buttonOnColourId, bgHover);
    loginButton.setColour(juce::TextButton::textColourOffId, textSecondary);
    loginButton.setColour(juce::TextButton::textColourOnId, textPrimary);
    
    // Logout button
    addAndMakeVisible(logoutButton);
    logoutButton.setButtonText("LOGOUT");
    logoutButton.addListener(this);
    logoutButton.setColour(juce::TextButton::buttonColourId, juce::Colours::transparentBlack);
    logoutButton.setColour(juce::TextButton::textColourOffId, textSecondary);
    logoutButton.setVisible(false);
    
    // Select file button - updated styling
    addAndMakeVisible(selectFileButton);
    selectFileButton.setButtonText("SELECT FILE");
    selectFileButton.addListener(this);
    selectFileButton.setColour(juce::TextButton::buttonColourId, juce::Colours::transparentBlack);
    selectFileButton.setColour(juce::TextButton::textColourOffId, textSecondary);
    
    // Use detected file button - updated styling
    addAndMakeVisible(useDetectedButton);
    useDetectedButton.setButtonText("USE DETECTED FILE");
    useDetectedButton.addListener(this);
    useDetectedButton.setColour(juce::TextButton::buttonColourId, juce::Colours::transparentBlack);
    useDetectedButton.setColour(juce::TextButton::textColourOffId, accentPrimary);
    useDetectedButton.setVisible(false);
    
    // Export button - primary accent color
    addAndMakeVisible(exportButton);
    exportButton.setButtonText("EXPORT TO ColDAW");
    exportButton.addListener(this);
    exportButton.setColour(juce::TextButton::buttonColourId, accentPrimary);
    exportButton.setColour(juce::TextButton::textColourOffId, textPrimary);
    exportButton.setColour(juce::TextButton::buttonOnColourId, accentPrimary.brighter(0.2f));
    exportButton.setEnabled(false);
    
    // Auto-export toggle
    addAndMakeVisible(autoExportToggle);
    autoExportToggle.setButtonText("AUTO-EXPORT ON SAVE");
    autoExportToggle.addListener(this);
    autoExportToggle.setToggleState(audioProcessor.getAutoExport(), juce::dontSendNotification);
    autoExportToggle.setColour(juce::ToggleButton::textColourId, textSecondary);
    autoExportToggle.setColour(juce::ToggleButton::tickColourId, accentPrimary);
    
    // Confirm Updates button (initially hidden)
    addAndMakeVisible(confirmUpdatesButton);
    confirmUpdatesButton.setButtonText("CONFIRM UPDATES");
    confirmUpdatesButton.addListener(this);
    confirmUpdatesButton.setColour(juce::TextButton::buttonColourId, successColor);
    confirmUpdatesButton.setColour(juce::TextButton::textColourOffId, textPrimary);
    confirmUpdatesButton.setColour(juce::TextButton::buttonOnColourId, successColor.brighter(0.2f));
    confirmUpdatesButton.setVisible(false);
    
    // Status label with improved readability
    addAndMakeVisible(statusLabel);
    statusLabel.setText(audioProcessor.getStatusMessage(), juce::dontSendNotification);
    statusLabel.setFont(juce::FontOptions(11.0f));
    statusLabel.setColour(juce::Label::textColourId, accentPrimary);
    statusLabel.setJustificationType(juce::Justification::centred);
    
    // Current file with improved typography
    addAndMakeVisible(currentFileLabel);
    currentFileLabel.setText("PROJECT", juce::dontSendNotification);
    currentFileLabel.setFont(juce::FontOptions(11.0f, juce::Font::bold));
    currentFileLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(currentFileValue);
    currentFileValue.setText("NONE", juce::dontSendNotification);
    currentFileValue.setFont(juce::FontOptions(13.0f)); // Better readability
    currentFileValue.setColour(juce::Label::textColourId, textPrimary);
    
    // Update preview label
    addAndMakeVisible(updatePreviewLabel);
    updatePreviewLabel.setText("", juce::dontSendNotification);
    updatePreviewLabel.setFont(juce::FontOptions(11.0f));
    updatePreviewLabel.setColour(juce::Label::textColourId, textSecondary);
    updatePreviewLabel.setColour(juce::Label::backgroundColourId, bgTertiary);
    updatePreviewLabel.setJustificationType(juce::Justification::topLeft);
    updatePreviewLabel.setVisible(false);
    
    // Project Path with consistent styling
    addAndMakeVisible(projectPathLabel);
    projectPathLabel.setText("PROJECT PATH", juce::dontSendNotification);
    projectPathLabel.setFont(juce::FontOptions(11.0f, juce::Font::bold));
    projectPathLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(projectPathEditor);
    projectPathEditor.setText(audioProcessor.getProjectPath());
    projectPathEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    projectPathEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    projectPathEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    projectPathEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentPrimary);
    projectPathEditor.setBorder(juce::BorderSize<int>(1));
    projectPathEditor.setFont(juce::FontOptions(13.0f));
    projectPathEditor.addListener(this);
    
    // User ID with consistent styling
    addAndMakeVisible(userIdLabel);
    userIdLabel.setText("USER ID", juce::dontSendNotification);
    userIdLabel.setFont(juce::FontOptions(11.0f, juce::Font::bold));
    userIdLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(userIdEditor);
    userIdEditor.setText(audioProcessor.getUserId());
    userIdEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    userIdEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    userIdEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    userIdEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentPrimary);
    userIdEditor.setBorder(juce::BorderSize<int>(1));
    userIdEditor.setFont(juce::FontOptions(13.0f));
    userIdEditor.addListener(this);
    
    // Author with consistent styling
    addAndMakeVisible(authorLabel);
    authorLabel.setText("AUTHOR", juce::dontSendNotification);
    authorLabel.setFont(juce::FontOptions(11.0f, juce::Font::bold));
    authorLabel.setColour(juce::Label::textColourId, textSecondary);
    
    addAndMakeVisible(authorEditor);
    authorEditor.setText(audioProcessor.getAuthor());
    authorEditor.setColour(juce::TextEditor::backgroundColourId, bgSecondary);
    authorEditor.setColour(juce::TextEditor::textColourId, textPrimary);
    authorEditor.setColour(juce::TextEditor::outlineColourId, borderColor);
    authorEditor.setColour(juce::TextEditor::focusedOutlineColourId, accentPrimary);
    authorEditor.setBorder(juce::BorderSize<int>(1));
    authorEditor.setFont(juce::FontOptions(13.0f));
    authorEditor.addListener(this);
    
    // Start timer to update status
    startTimer(500);
}

ColDawExportEditor::~ColDawExportEditor()
{
    stopTimer();
    setLookAndFeel(nullptr);
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
    auto area = getLocalBounds().reduced(24); // Increased padding to match web style
    int margin = 16;  // Match web theme spacing (md)
    int smallMargin = 8; // Match web theme spacing (sm)
    
    // Title section - more spacious
    titleLabel.setBounds(area.removeFromTop(28));
    area.removeFromTop(smallMargin);
    loginStatusLabel.setBounds(area.removeFromTop(18));
    area.removeFromTop(margin);
    
    // Login section with better spacing
    usernameLabel.setBounds(area.removeFromTop(16));
    area.removeFromTop(smallMargin);
    usernameEditor.setBounds(area.removeFromTop(32)); // Taller inputs
    area.removeFromTop(margin);
    
    passwordLabel.setBounds(area.removeFromTop(16));
    area.removeFromTop(smallMargin);
    passwordEditor.setBounds(area.removeFromTop(32));
    area.removeFromTop(margin);
    
    // Button row with better spacing
    auto buttonRow = area.removeFromTop(36); // Taller buttons
    loginButton.setBounds(buttonRow.removeFromLeft(160));
    buttonRow.removeFromLeft(smallMargin);
    logoutButton.setBounds(buttonRow);
    area.removeFromTop(static_cast<int>(margin * 1.5)); // Extra space after login section
    
    // Project Path section
    projectPathLabel.setBounds(area.removeFromTop(16));
    area.removeFromTop(smallMargin);
    projectPathEditor.setBounds(area.removeFromTop(32));
    area.removeFromTop(margin);
    
    // Action buttons with consistent height
    selectFileButton.setBounds(area.removeFromTop(32));
    area.removeFromTop(smallMargin);
    
    // Use detected button (conditionally shown)
    if (useDetectedButton.isVisible())
    {
        useDetectedButton.setBounds(area.removeFromTop(32));
        area.removeFromTop(smallMargin);
    }
    
    // Export button - more prominent
    exportButton.setBounds(area.removeFromTop(40));  // Taller primary button
    area.removeFromTop(margin);
    
    // Confirm Updates button (conditionally shown)
    if (confirmUpdatesButton.isVisible())
    {
        confirmUpdatesButton.setBounds(area.removeFromTop(40));
        area.removeFromTop(margin);
        
        // Show update preview if available
        if (updatePreviewLabel.isVisible())
        {
            updatePreviewLabel.setBounds(area.removeFromTop(80));
            area.removeFromTop(margin);
        }
    }
    
    autoExportToggle.setBounds(area.removeFromTop(28));
    area.removeFromTop(margin);
    
    // Status section
    statusLabel.setBounds(area.removeFromTop(24));
    area.removeFromTop(margin);
    
    // Current file section
    currentFileLabel.setBounds(area.removeFromTop(16));
    area.removeFromTop(smallMargin);
    currentFileValue.setBounds(area.removeFromTop(22));
    area.removeFromTop(margin);
    
    // User ID section
    userIdLabel.setBounds(area.removeFromTop(16));
    area.removeFromTop(smallMargin);
    userIdEditor.setBounds(area.removeFromTop(32));
    area.removeFromTop(margin);
    
    // Author section
    authorLabel.setBounds(area.removeFromTop(16));
    area.removeFromTop(smallMargin);
    authorEditor.setBounds(area.removeFromTop(32));
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
    
    // Show Fetch/Confirm Updates button if user can fetch updates
    bool canFetch = audioProcessor.canFetchUpdates();
    bool hasPreviewed = audioProcessor.hasPreviewedUpdate();
    
    // Button should be visible if user can fetch OR has already previewed
    bool shouldShowButton = canFetch || hasPreviewed;
    
    if (confirmUpdatesButton.isVisible() != shouldShowButton)
    {
        confirmUpdatesButton.setVisible(shouldShowButton);
        resized(); // Trigger layout update
    }
    
    // Update button text and color based on preview state
    if (shouldShowButton)
    {
        if (hasPreviewed)
        {
            // User has fetched/previewed update - show CONFIRM button
            confirmUpdatesButton.setButtonText("CONFIRM UPDATES");
            confirmUpdatesButton.setColour(juce::TextButton::buttonColourId, successColor);
            confirmUpdatesButton.setColour(juce::TextButton::buttonOnColourId, successColor.brighter(0.2f));
            
            // Show and update preview label
            juce::String previewText = audioProcessor.getUpdatePreview();
            updatePreviewLabel.setText(previewText, juce::dontSendNotification);
            if (!updatePreviewLabel.isVisible())
            {
                updatePreviewLabel.setVisible(true);
                resized();
            }
        }
        else
        {
            // User can fetch updates - show FETCH button
            confirmUpdatesButton.setButtonText("FETCH UPDATES");
            confirmUpdatesButton.setColour(juce::TextButton::buttonColourId, juce::Colour(0xff4a90e2)); // Blue color
            confirmUpdatesButton.setColour(juce::TextButton::buttonOnColourId, juce::Colour(0xff4a90e2).brighter(0.2f));
            
            // Hide preview label when not previewed
            if (updatePreviewLabel.isVisible())
            {
                updatePreviewLabel.setVisible(false);
                resized();
            }
        }
    }
    else
    {
        // Hide preview label when button not shown
        if (updatePreviewLabel.isVisible())
        {
            updatePreviewLabel.setVisible(false);
            resized();
        }
    }
    
    // Show/hide "Use Detected File" button
    juce::File detectedFile = audioProcessor.getDetectedFile();
    bool hasDetectedFile = detectedFile.existsAsFile();
    bool hasCurrentFile = !audioProcessor.getCurrentProjectName().isEmpty() && 
                          audioProcessor.getCurrentProjectName() != "None";
    
    // Only show button if we have a detected file and no current file selected
    bool shouldShowDetectedButton = hasDetectedFile && !hasCurrentFile;
    if (useDetectedButton.isVisible() != shouldShowDetectedButton)
    {
        useDetectedButton.setVisible(shouldShowDetectedButton);
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
    else if (button == &confirmUpdatesButton)
    {
        // Check if we have a previewed update or need to fetch first
        if (audioProcessor.hasPreviewedUpdate())
        {
            // Confirm and apply the previewed update
            audioProcessor.confirmWebUpdate();
        }
        else
        {
            // Fetch the update for preview
            audioProcessor.fetchWebUpdate();
        }
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
