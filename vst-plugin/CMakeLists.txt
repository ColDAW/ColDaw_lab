cmake_minimum_required(VERSION 3.15)

project(ColDawExport VERSION 1.0.0)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add JUCE
# You need to download JUCE and set JUCE_PATH
# Download from: https://github.com/juce-framework/JUCE
set(JUCE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../JUCE" CACHE PATH "Path to JUCE framework")

if(NOT EXISTS "${JUCE_PATH}/modules/juce_core/juce_core.h")
    message(FATAL_ERROR 
        "JUCE not found at ${JUCE_PATH}. "
        "Please download JUCE from https://github.com/juce-framework/JUCE "
        "and set JUCE_PATH to the JUCE root directory, or place JUCE in ${CMAKE_CURRENT_SOURCE_DIR}/../JUCE")
endif()

add_subdirectory(${JUCE_PATH} JUCE)

# Create the plugin target
juce_add_plugin(ColDawExport
    COMPANY_NAME "ColDaw"
    COMPANY_WEBSITE "https://github.com/yourusername/coldaw"
    PLUGIN_MANUFACTURER_CODE CoDw
    PLUGIN_CODE CdEx
    FORMATS VST3 AU Standalone
    PRODUCT_NAME "ColDaw Export"
    
    # Set plugin characteristics
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE
    
    # Copy plugin to common locations after build
    COPY_PLUGIN_AFTER_BUILD TRUE
)

# Add source files
target_sources(ColDawExport
    PRIVATE
        Source/PluginProcessor.cpp
        Source/PluginEditor.cpp
)

# Link JUCE modules
target_link_libraries(ColDawExport
    PRIVATE
        juce::juce_audio_basics
        juce::juce_audio_devices
        juce::juce_audio_formats
        juce::juce_audio_plugin_client
        juce::juce_audio_processors
        juce::juce_audio_utils
        juce::juce_core
        juce::juce_data_structures
        juce::juce_events
        juce::juce_graphics
        juce::juce_gui_basics
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# Compile definitions
target_compile_definitions(ColDawExport
    PUBLIC
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=1
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_DISPLAY_SPLASH_SCREEN=0
        JUCE_REPORT_APP_USAGE=0
)

# Set output directory
set_target_properties(ColDawExport PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/plugins"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/plugins"
)
