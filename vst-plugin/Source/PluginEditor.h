#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

//==============================================================================
/**
 * Custom Look and Feel class for ColDAW style buttons with gradient borders
 */
class ColDAWLookAndFeel : public juce::LookAndFeel_V4
{
public:
    ColDAWLookAndFeel();
    
    void drawButtonBackground (juce::Graphics& g,
                             juce::Button& button,
                             const juce::Colour& backgroundColour,
                             bool shouldDrawButtonAsHighlighted,
                             bool shouldDrawButtonAsDown) override;
                             
    void drawButtonText (juce::Graphics& g,
                        juce::TextButton& button,
                        bool shouldDrawButtonAsHighlighted,
                        bool shouldDrawButtonAsDown) override;

private:
    // Gradient colors for border effect
    juce::Array<juce::Colour> gradientColors;
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ColDAWLookAndFeel)
};

//==============================================================================
/**
 * ColDaw Export Plugin - Editor (GUI)
 */
class ColDawExportEditor : public juce::AudioProcessorEditor,
                            public juce::Timer,
                            public juce::Button::Listener,
                            public juce::TextEditor::Listener,
                            public juce::Label::Listener
{
public:
    ColDawExportEditor (ColDawExportProcessor&);
    ~ColDawExportEditor() override;

    //==============================================================================
    void paint (juce::Graphics&) override;
    void resized() override;
    
    void timerCallback() override;
    void buttonClicked (juce::Button* button) override;
    void textEditorTextChanged (juce::TextEditor&) override;
    void labelTextChanged (juce::Label* label) override;

private:
    ColDawExportProcessor& audioProcessor;
    
    // Custom Look and Feel
    ColDAWLookAndFeel customLookAndFeel;
    
    // UI Components
    juce::TextButton exportButton;
    juce::TextButton selectFileButton;
    juce::TextButton loginButton;
    juce::TextButton logoutButton;
    juce::TextButton useDetectedButton;
    juce::TextButton confirmUpdatesButton;
    juce::ToggleButton autoExportToggle;
    
    juce::Label statusLabel;
    juce::Label titleLabel;
    juce::Label loginStatusLabel;
    
    // Login fields
    juce::Label usernameLabel;
    juce::TextEditor usernameEditor;
    juce::Label passwordLabel;
    juce::TextEditor passwordEditor;
    
    juce::Label userIdLabel;
    juce::TextEditor userIdEditor;
    
    juce::Label authorLabel;
    juce::TextEditor authorEditor;
    
    juce::Label currentFileLabel;
    juce::Label currentFileValue;
    
    juce::Label updatePreviewLabel;
    
    juce::Label projectPathLabel;
    juce::TextEditor projectPathEditor;
    
    // ColDAW Web UI inspired colors - consistent with web theme
    juce::Colour bgPrimary {0xff0a0a0a};        // Deep black background
    juce::Colour bgSecondary {0xff141414};      // Secondary background
    juce::Colour bgTertiary {0xff1e1e1e};       // Tertiary background
    juce::Colour bgHover {0xff2a2a2a};          // Hover background
    
    juce::Colour textPrimary {0xffffffff};      // White text
    juce::Colour textSecondary {0xffb0b0b0};    // Secondary gray text
    juce::Colour textTertiary {0xff707070};     // Tertiary gray text
    
    juce::Colour accentPrimary {0xffEB5A72};    // Primary accent color
    juce::Colour accentOrange {0xffEB5A72};     // Consistent with web theme
    juce::Colour accentBlue {0xffEB5A72};       // Using primary color
    
    juce::Colour borderColor {0xff2a2a2a};      // Border color
    juce::Colour borderActive {0xff404040};     // Active border color
    
    juce::Colour errorColor {0xffEB5A72};       // Error color
    juce::Colour successColor {0xff4CAF50};     // Success color
    juce::Colour warningColor {0xffFF9800};     // Warning color
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ColDawExportEditor)
};
