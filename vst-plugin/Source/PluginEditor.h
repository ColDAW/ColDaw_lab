#pragma once

#include <juce_gui_extra/juce_gui_extra.h>
#include "PluginProcessor.h"

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
    
    // UI Components
    juce::TextButton exportButton;
    juce::TextButton selectFileButton;
    juce::TextButton loginButton;
    juce::TextButton logoutButton;
    juce::TextButton useDetectedButton;
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
    
    juce::Label projectPathLabel;
    juce::TextEditor projectPathEditor;
    
    // Teenage Engineering inspired colors
    juce::Colour bgPrimary {0xff0a0a0a};        // Deep black background
    juce::Colour bgSecondary {0xff1a1a1a};      // Slightly lighter black
    juce::Colour accentOrange {0xffff6b35};     // TE orange
    juce::Colour textPrimary {0xffffffff};      // White text
    juce::Colour textSecondary {0xff999999};    // Gray text
    juce::Colour borderColor {0xff333333};      // Subtle borders
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ColDawExportEditor)
};
