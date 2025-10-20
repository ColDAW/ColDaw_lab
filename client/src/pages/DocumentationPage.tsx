import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, Book, Download, Play, Settings, Users, 
  ChevronRight, ExternalLink, FileText, Video, 
  MessageCircle, Mail, Github
} from 'lucide-react';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
  font-family: 'Poppins', sans-serif;
`;

const Header = styled.header`
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  color: #fff;
  margin: 0;
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 3rem 0 4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  margin-bottom: 1rem;
  color: #fff;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$variant === 'primary' ? `
    background: #ffffff;
    border: none;
    color: #0a0a0a;
    
    &:hover {
      background: #e0e0e0;
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    border: 1px solid #333;
    color: #ffffff;
    
    &:hover {
      background: #1a1a1a;
      border-color: #555;
    }
  `}
`;

const SectionsContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 3rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Sidebar = styled.nav`
  @media (max-width: 768px) {
    order: 2;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarLink = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: ${props => props.$active ? '#fff' : '#aaa'};
  padding: 0.5rem 0;
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    color: #fff;
  }
`;

const MainContent = styled.div`
  @media (max-width: 768px) {
    order: 1;
  }
`;

const Section = styled.section<{ $visible?: boolean }>`
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 400;
  color: #fff;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SubsectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 500;
  color: #fff;
  margin: 2rem 0 1rem;
`;

const Text = styled.p`
  color: #ccc;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-size: 1rem;
`;

const List = styled.ul`
  color: #ccc;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const CodeBlock = styled.pre`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  color: #e0e0e0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const FeatureCard = styled.div`
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(51, 51, 51, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(26, 26, 26, 0.8);
    border-color: rgba(85, 85, 85, 0.8);
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #aaa;
  }
`;

const FeatureTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: #aaa;
  line-height: 1.6;
  font-size: 0.9rem;
  margin: 0;
`;

const ContactSection = styled.div`
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(51, 51, 51, 0.6);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  text-decoration: none;
  color: #ccc;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #aaa;
  }
`;

const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  const handleBack = () => {
    navigate('/');
  };

  const handleDownloadVST = () => {
    const link = document.createElement('a');
    link.href = '/downloads/ColDaw-Export.vst3.zip';
    link.download = 'ColDaw-Export-VST3.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sidebarSections = [
    {
      title: 'Getting Started',
      items: [
        { id: 'getting-started', label: 'Quick Start Guide', icon: <Play size={16} /> },
        { id: 'installation', label: 'Installation', icon: <Download size={16} /> },
        { id: 'setup', label: 'Setup & Configuration', icon: <Settings size={16} /> },
      ]
    },
    {
      title: 'Features',
      items: [
        { id: 'editor', label: 'Web Editor', icon: <Book size={16} /> },
        { id: 'collaboration', label: 'Collaboration', icon: <Users size={16} /> },
        { id: 'vst-plugin', label: 'VST Plugin', icon: <ExternalLink size={16} /> },
      ]
    },
    {
      title: 'Resources',
      items: [
        { id: 'tutorials', label: 'Video Tutorials', icon: <Video size={16} /> },
        { id: 'faq', label: 'FAQ', icon: <MessageCircle size={16} /> },
        { id: 'support', label: 'Support', icon: <Mail size={16} /> },
      ]
    }
  ];

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
            Back to Home
          </BackButton>
          <Title>Documentation</Title>
        </HeaderContent>
      </Header>

      <Content>
        <HeroSection>
          <HeroTitle>ColDAW Documentation</HeroTitle>
          <HeroSubtitle>
            Everything you need to know about using ColDAW for collaborative music production. 
            From setup to advanced features, we've got you covered.
          </HeroSubtitle>
          <QuickActions>
            <ActionButton $variant="primary" onClick={() => setActiveSection('getting-started')}>
              <Play size={16} />
              Quick Start
            </ActionButton>
            <ActionButton $variant="secondary" onClick={handleDownloadVST}>
              <Download size={16} />
              Download VST
            </ActionButton>
            <ActionButton $variant="secondary" onClick={() => navigate('/editor')}>
              <ExternalLink size={16} />
              Open Editor
            </ActionButton>
          </QuickActions>
        </HeroSection>

        <SectionsContainer>
          <Sidebar>
            {sidebarSections.map((section) => (
              <SidebarSection key={section.title}>
                <SidebarTitle>{section.title}</SidebarTitle>
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.id}
                    $active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                  </SidebarLink>
                ))}
              </SidebarSection>
            ))}
          </Sidebar>

          <MainContent>
            {/* Getting Started Section */}
            <Section $visible={activeSection === 'getting-started'}>
              <SectionTitle>Quick Start Guide</SectionTitle>
              <Text>
                Welcome to ColDAW! This guide will help you get started with collaborative music production 
                in just a few minutes.
              </Text>

              <SubsectionTitle>What is ColDAW?</SubsectionTitle>
              <Text>
                ColDAW is a cloud-based Digital Audio Workstation (DAW) designed for collaborative music creation. 
                It combines the familiar workflow of traditional DAWs with modern version control and real-time 
                collaboration features.
              </Text>

              <FeatureGrid>
                <FeatureCard>
                  <FeatureIcon><Book /></FeatureIcon>
                  <FeatureTitle>Web-Based Editor</FeatureTitle>
                  <FeatureDescription>
                    Full-featured DAW interface accessible from any browser. No installation required.
                  </FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon><Users /></FeatureIcon>
                  <FeatureTitle>Real-time Collaboration</FeatureTitle>
                  <FeatureDescription>
                    Work with team members simultaneously. See changes in real-time and track contributions.
                  </FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon><Settings /></FeatureIcon>
                  <FeatureTitle>Version Control</FeatureTitle>
                  <FeatureDescription>
                    Git-like version control for music. Branch, merge, and track every change to your project.
                  </FeatureDescription>
                </FeatureCard>
              </FeatureGrid>

              <SubsectionTitle>Quick Setup (3 Steps)</SubsectionTitle>
              <List>
                <li><strong>Step 1:</strong> Open the ColDAW web editor (no account required to try)</li>
                <li><strong>Step 2:</strong> Create a new project or import from your DAW using our VST plugin</li>
                <li><strong>Step 3:</strong> Invite collaborators and start creating together</li>
              </List>
            </Section>

            {/* Installation Section */}
            <Section $visible={activeSection === 'installation'}>
              <SectionTitle>Installation Guide</SectionTitle>
              <Text>
                ColDAW offers multiple ways to access and integrate with your existing workflow.
              </Text>

              <SubsectionTitle>Web Editor (No Installation)</SubsectionTitle>
              <Text>
                The web editor runs directly in your browser. Simply visit the editor page and start creating. 
                For the best experience, we recommend using Chrome, Firefox, or Safari.
              </Text>

              <SubsectionTitle>PWA Installation</SubsectionTitle>
              <Text>
                Install ColDAW as a Progressive Web App (PWA) for a native app-like experience:
              </Text>
              <List>
                <li><strong>Chrome:</strong> Click the install icon in the address bar or menu → "Install ColDAW"</li>
                <li><strong>Safari:</strong> Share menu → "Add to Home Screen"</li>
                <li><strong>Firefox:</strong> Look for the install prompt or use "Add to Home Screen"</li>
              </List>

              <SubsectionTitle>VST Plugin Installation</SubsectionTitle>
              <Text>
                The ColDAW VST plugin allows you to export projects from your existing DAW directly to ColDAW:
              </Text>
              <List>
                <li><strong>Download:</strong> Get the VST3 plugin from our downloads section</li>
                <li><strong>Windows:</strong> Extract to <code>C:\Program Files\Common Files\VST3\</code></li>
                <li><strong>macOS:</strong> Extract to <code>/Library/Audio/Plug-Ins/VST3/</code></li>
                <li><strong>Restart:</strong> Restart your DAW and look for "ColDaw Export" in your plugins</li>
              </List>

              <ActionButton $variant="primary" onClick={handleDownloadVST}>
                <Download size={16} />
                Download VST Plugin
              </ActionButton>
            </Section>

            {/* Setup Section */}
            <Section $visible={activeSection === 'setup'}>
              <SectionTitle>Setup & Configuration</SectionTitle>
              <Text>
                Configure ColDAW to work best with your workflow and hardware setup.
              </Text>

              <SubsectionTitle>Audio Settings</SubsectionTitle>
              <Text>
                ColDAW automatically detects your audio devices, but you can customize settings for optimal performance:
              </Text>
              <List>
                <li><strong>Sample Rate:</strong> 44.1kHz or 48kHz recommended</li>
                <li><strong>Buffer Size:</strong> 128-512 samples (lower = less latency, higher = more stable)</li>
                <li><strong>Audio Input:</strong> Select your audio interface or microphone</li>
              </List>

              <SubsectionTitle>Collaboration Settings</SubsectionTitle>
              <Text>
                Set up your collaboration preferences:
              </Text>
              <List>
                <li><strong>Display Name:</strong> How others see you in collaborative sessions</li>
                <li><strong>Permissions:</strong> Control who can edit vs. view your projects</li>
                <li><strong>Notifications:</strong> Choose when to be notified of changes</li>
              </List>

              <SubsectionTitle>VST Plugin Configuration</SubsectionTitle>
              <Text>
                Configure the VST plugin in your DAW:
              </Text>
              <CodeBlock>
{`1. Load "ColDaw Export" as an insert effect on your master bus
2. Set your project name and description
3. Configure audio quality settings
4. Click "Export to ColDAW" when ready to upload`}
              </CodeBlock>
            </Section>

            {/* Editor Section */}
            <Section $visible={activeSection === 'editor'}>
              <SectionTitle>Web Editor Guide</SectionTitle>
              <Text>
                The ColDAW web editor provides a complete DAW experience in your browser.
              </Text>

              <SubsectionTitle>Interface Overview</SubsectionTitle>
              <Text>
                The editor interface is designed to be familiar to DAW users:
              </Text>
              <List>
                <li><strong>Track Area:</strong> Arrange and edit your audio tracks</li>
                <li><strong>Mixer:</strong> Control volume, panning, and effects</li>
                <li><strong>Timeline:</strong> Navigate through your project</li>
                <li><strong>Browser:</strong> Access samples, loops, and project files</li>
                <li><strong>Collaboration Panel:</strong> See active collaborators and changes</li>
              </List>

              <SubsectionTitle>Key Features</SubsectionTitle>
              <FeatureGrid>
                <FeatureCard>
                  <FeatureIcon><FileText /></FeatureIcon>
                  <FeatureTitle>Project Management</FeatureTitle>
                  <FeatureDescription>
                    Create, save, and organize projects in the cloud. Access from anywhere.
                  </FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon><Settings /></FeatureIcon>
                  <FeatureTitle>Built-in Effects</FeatureTitle>
                  <FeatureDescription>
                    Professional effects including EQ, compression, reverb, and more.
                  </FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon><ExternalLink /></FeatureIcon>
                  <FeatureTitle>Import/Export</FeatureTitle>
                  <FeatureDescription>
                    Import from other DAWs via VST plugin. Export to standard audio formats.
                  </FeatureDescription>
                </FeatureCard>
              </FeatureGrid>

              <SubsectionTitle>Keyboard Shortcuts</SubsectionTitle>
              <CodeBlock>
{`Space Bar        - Play/Pause
Ctrl/Cmd + S     - Save Project  
Ctrl/Cmd + Z     - Undo
Ctrl/Cmd + Y     - Redo
R               - Record
G               - Show/Hide Grid
M               - Mute Selected Track
S               - Solo Selected Track`}
              </CodeBlock>
            </Section>

            {/* Collaboration Section */}
            <Section $visible={activeSection === 'collaboration'}>
              <SectionTitle>Collaboration Features</SectionTitle>
              <Text>
                ColDAW's collaboration features make it easy to work with team members anywhere in the world.
              </Text>

              <SubsectionTitle>Real-time Collaboration</SubsectionTitle>
              <Text>
                Multiple users can work on the same project simultaneously:
              </Text>
              <List>
                <li><strong>Live Cursors:</strong> See where others are working in real-time</li>
                <li><strong>Change Tracking:</strong> All edits are tracked and attributed</li>
                <li><strong>Conflict Resolution:</strong> Automatic merging of non-conflicting changes</li>
                <li><strong>Chat Integration:</strong> Communicate with team members while working</li>
              </List>

              <SubsectionTitle>Version Control</SubsectionTitle>
              <Text>
                Git-like version control system designed for music production:
              </Text>
              <List>
                <li><strong>Branches:</strong> Create separate versions for experimentation</li>
                <li><strong>Commits:</strong> Save snapshots of your progress with descriptions</li>
                <li><strong>Merging:</strong> Combine different versions intelligently</li>
                <li><strong>History:</strong> View complete project history and revert changes</li>
              </List>

              <SubsectionTitle>Sharing & Permissions</SubsectionTitle>
              <Text>
                Control access to your projects:
              </Text>
              <List>
                <li><strong>Public Projects:</strong> Share with the community</li>
                <li><strong>Private Projects:</strong> Invite specific collaborators</li>
                <li><strong>View-only Access:</strong> Let others listen without editing rights</li>
                <li><strong>Role Management:</strong> Assign different permission levels</li>
              </List>
            </Section>

            {/* VST Plugin Section */}
            <Section $visible={activeSection === 'vst-plugin'}>
              <SectionTitle>VST Plugin Guide</SectionTitle>
              <Text>
                The ColDAW VST plugin bridges your existing DAW workflow with ColDAW's collaboration features.
              </Text>

              <SubsectionTitle>Compatible DAWs</SubsectionTitle>
              <Text>
                The VST3 plugin works with most modern DAWs:
              </Text>
              <List>
                <li>Ableton Live 10+</li>
                <li>Logic Pro X/Logic Pro 11</li>
                <li>Pro Tools 2020+</li>
                <li>FL Studio 20+</li>
                <li>Cubase/Nuendo 10+</li>
                <li>Reaper 6+</li>
                <li>Studio One 5+</li>
              </List>

              <SubsectionTitle>How to Use</SubsectionTitle>
              <Text>
                Export your DAW projects to ColDAW in a few simple steps:
              </Text>
              <List>
                <li><strong>Step 1:</strong> Load "ColDaw Export" on your master bus</li>
                <li><strong>Step 2:</strong> Configure project settings in the plugin</li>
                <li><strong>Step 3:</strong> Set audio quality and format preferences</li>
                <li><strong>Step 4:</strong> Click "Export to ColDAW" to upload</li>
                <li><strong>Step 5:</strong> Open the project in ColDAW web editor</li>
              </List>

              <SubsectionTitle>Export Settings</SubsectionTitle>
              <Text>
                Customize how your project is exported:
              </Text>
              <List>
                <li><strong>Audio Quality:</strong> 16-bit, 24-bit, or 32-bit float</li>
                <li><strong>Sample Rate:</strong> Match your project or upsample</li>
                <li><strong>Stems Export:</strong> Individual tracks or full mix</li>
                <li><strong>MIDI Data:</strong> Include MIDI tracks for further editing</li>
              </List>

              <ActionButton $variant="primary" onClick={handleDownloadVST}>
                <Download size={16} />
                Download VST Plugin
              </ActionButton>
            </Section>

            {/* Tutorials Section */}
            <Section $visible={activeSection === 'tutorials'}>
              <SectionTitle>Video Tutorials</SectionTitle>
              <Text>
                Learn ColDAW with our comprehensive video tutorial series.
              </Text>

              <FeatureGrid>
                <FeatureCard>
                  <FeatureIcon><Play /></FeatureIcon>
                  <FeatureTitle>Getting Started (5 min)</FeatureTitle>
                  <FeatureDescription>
                    Quick overview of ColDAW features and basic workflow.
                  </FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon><Users /></FeatureIcon>
                  <FeatureTitle>Collaboration Basics (8 min)</FeatureTitle>
                  <FeatureDescription>
                    Learn how to invite collaborators and work together in real-time.
                  </FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon><ExternalLink /></FeatureIcon>
                  <FeatureTitle>VST Plugin Tutorial (10 min)</FeatureTitle>
                  <FeatureDescription>
                    Step-by-step guide to exporting from your DAW to ColDAW.
                  </FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon><Settings /></FeatureIcon>
                  <FeatureTitle>Advanced Features (15 min)</FeatureTitle>
                  <FeatureDescription>
                    Explore version control, branching, and advanced collaboration.
                  </FeatureDescription>
                </FeatureCard>
              </FeatureGrid>

              <Text>
                <strong>Coming Soon:</strong> Interactive tutorials and guided tours within the ColDAW editor.
              </Text>
            </Section>

            {/* FAQ Section */}
            <Section $visible={activeSection === 'faq'}>
              <SectionTitle>Frequently Asked Questions</SectionTitle>

              <SubsectionTitle>General Questions</SubsectionTitle>
              
              <Text><strong>Q: Is ColDAW free to use?</strong></Text>
              <Text>A: ColDAW offers a free tier with basic features. Premium plans include advanced collaboration tools, unlimited storage, and priority support.</Text>

              <Text><strong>Q: Do I need to install anything?</strong></Text>
              <Text>A: No installation required! ColDAW runs in your web browser. Optionally, you can install it as a PWA or use our VST plugin.</Text>

              <Text><strong>Q: What audio formats are supported?</strong></Text>
              <Text>A: ColDAW supports WAV, MP3, FLAC, and AIFF files. For VST export, we support up to 32-bit float at 192kHz.</Text>

              <SubsectionTitle>Technical Questions</SubsectionTitle>
              
              <Text><strong>Q: What are the system requirements?</strong></Text>
              <Text>A: Modern web browser (Chrome, Firefox, Safari, Edge), stable internet connection, and audio device. 4GB+ RAM recommended for large projects.</Text>

              <Text><strong>Q: Can I work offline?</strong></Text>
              <Text>A: Limited offline functionality is available with the PWA. Full offline mode is planned for future releases.</Text>

              <Text><strong>Q: How is my data protected?</strong></Text>
              <Text>A: All data is encrypted in transit and at rest. We use industry-standard security practices and never share your projects without permission.</Text>

              <SubsectionTitle>Collaboration Questions</SubsectionTitle>
              
              <Text><strong>Q: How many people can collaborate on a project?</strong></Text>
              <Text>A: Free accounts support up to 3 collaborators. Premium plans support unlimited collaborators.</Text>

              <Text><strong>Q: Can I see who made what changes?</strong></Text>
              <Text>A: Yes! All changes are tracked and attributed to specific users, similar to Google Docs but for music.</Text>
            </Section>

            {/* Support Section */}
            <Section $visible={activeSection === 'support'}>
              <SectionTitle>Support & Contact</SectionTitle>
              <Text>
                Need help? We're here to support you on your musical journey.
              </Text>

              <ContactSection>
                <SubsectionTitle>Get in Touch</SubsectionTitle>
                <Text>
                  Choose the best way to reach us based on your needs:
                </Text>
                <ContactGrid>
                  <ContactItem href="mailto:support@coldaw.com">
                    <Mail />
                    <div>
                      <div><strong>Email Support</strong></div>
                      <div>support@coldaw.com</div>
                    </div>
                  </ContactItem>
                  <ContactItem href="https://github.com/coldaw/issues" target="_blank">
                    <Github />
                    <div>
                      <div><strong>Bug Reports</strong></div>
                      <div>GitHub Issues</div>
                    </div>
                  </ContactItem>
                  <ContactItem href="#community" onClick={(e) => e.preventDefault()}>
                    <MessageCircle />
                    <div>
                      <div><strong>Community</strong></div>
                      <div>Discord Server</div>
                    </div>
                  </ContactItem>
                </ContactGrid>
              </ContactSection>

              <SubsectionTitle>Before Contacting Support</SubsectionTitle>
              <Text>
                To help us assist you quickly, please:
              </Text>
              <List>
                <li>Check this documentation and FAQ section</li>
                <li>Note your browser version and operating system</li>
                <li>Describe the issue with steps to reproduce</li>
                <li>Include any error messages you're seeing</li>
              </List>

              <SubsectionTitle>Response Times</SubsectionTitle>
              <List>
                <li><strong>Email Support:</strong> 24-48 hours (free), 4-8 hours (premium)</li>
                <li><strong>Bug Reports:</strong> We triage GitHub issues within 24 hours</li>
                <li><strong>Community:</strong> Community-driven support, often faster responses</li>
              </List>

              <Text>
                <strong>Emergency Issues:</strong> For urgent production-related issues, premium users can use our priority support channel.
              </Text>
            </Section>
          </MainContent>
        </SectionsContainer>
      </Content>
    </PageContainer>
  );
};

export default DocumentationPage;