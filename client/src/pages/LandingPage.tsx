import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Play, Users, Music, Download,
  Volume2, Layers, Sparkles
} from 'lucide-react';
import thumbnail_vid from '../img/thumbnail_vid.mp4';

// Dark mode inspired design - minimalist, elegant, typography-focused
const LandingContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ffffff;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  
  /* Override global body overflow hidden for landing page */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  max-width: 1480px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(211, 211, 211, 1);
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.02em;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #aaa;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  transition: color 0.3s ease;
  
  &:hover {
    color: rgba(211, 211, 211, 1);
  }
`;

const CTAButton = styled.button`
  background: rgba(211, 211, 211, 1);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  color: #0a0a0a;
  font-weight: 500;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
    transform: translateY(-1px);
  }
`;

const HeroSection = styled.section`
  padding: 8rem 1rem 4rem;
  background: #0a0a0a;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 6rem 1rem 3rem;
  }
`;

const HeroContent = styled.div`
  max-width: 1400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.8rem, 5vw, 3.2rem);
  font-weight: 480;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: rgba(211, 211, 211, 1);
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-family: 'Poppins', sans-serif;
  max-width: 1200px;
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: clamp(1.5rem, 6vw, 2.5rem);
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  color: #838383ff;
  margin-bottom: 3rem;
  max-width: 1000px;
  line-height: 1.6;
  font-weight: 200;
  font-family: 'Poppins', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
    max-width: 100%;
  }
`;

const HeroVideo = styled.video`
  width: 100%;
  max-width: 98%;
  aspect-ratio: 16/9;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 3rem;
  margin-bottom: 0;
  object-fit: cover;
  box-shadow: 0 0 32pxrgba(255, 255, 255, 0.09));
  transition: all 0.6s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
  }
  
  @media (max-width: 768px) {
    border-radius: 16px;
    margin-top: 2rem;
    margin-bottom: 0;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin-bottom: 0;
  }
`;

const PrimaryButton = styled.button`
  background: #ffffff;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 6px;
  color: #0a0a0a;
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #e0e0e0;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1.2rem 2rem;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid #333;
  padding: 1rem 2.5rem;
  border-radius: 6px;
  color: #ffffff;
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: #1a1a1a;
    border-color: #555;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1.2rem 2rem;
  }
`;

const FeaturesSection = styled.section`
  padding: 8rem 0;
  background: #111111;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 400;
  text-align: center;
  margin-bottom: 1rem;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-left: 2rem;
  margin-right: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
`;

const FeatureCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border-color: #555;
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: #aaa;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  line-height: 1.3;
`;

const FeatureDescription = styled.p`
  color: #aaa;
  line-height: 1.6;
  font-size: 0.88rem;
  font-family: 'Poppins', sans-serif;
`;

const Footer = styled.footer`
  background: #0a0a0a;
  padding: 4rem 2rem 3rem;
  text-align: center;
  border-top: 1px solid #333;
  
  p {
    color: #666;
    font-size: 0.9rem;
    font-family: 'Poppins', sans-serif;
    margin: 0;
  }
`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Enable scrolling for landing page
  useEffect(() => {
    // Store original overflow value
    const originalOverflow = document.body.style.overflow;
    
    // Enable scrolling for landing page
    document.body.style.overflow = 'auto';
    
    // Cleanup: restore original overflow when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/editor');
  };

  return (
    <LandingContainer>
      <Header>
        <Nav>
          <Logo>ColDAW</Logo>
          <NavLinks>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#support">Support</NavLink>
          </NavLinks>
          <CTAButton onClick={handleGetStarted}>Editor</CTAButton>
        </Nav>
      </Header>

        <HeroSection>
          <HeroContent>
            <HeroTitle>Bring Your DAW into the Collaboration Era</HeroTitle>
            <HeroSubtitle>
              Say goodbye to file chaos and version conflicts. ColDAW enables musicians to quickly import DAW projects and achieve real-time collaboration, version tracking, and automatic merging for a seamless creative experience.
            </HeroSubtitle>
            
            <HeroButtons>
              <PrimaryButton onClick={handleGetStarted}>
                <Play size={18} />
                Start Creating
              </PrimaryButton>
              <SecondaryButton>
                <Download size={18} />
                Download Plugin
              </SecondaryButton>
            </HeroButtons>
            
            <HeroVideo 
              autoPlay 
              muted 
              loop 
              playsInline
              src={thumbnail_vid}
            />
          </HeroContent>
        </HeroSection>

        <FeaturesSection id="features">
          <SectionTitle>Collaborative Creation Redefined</SectionTitle>
          <SectionSubtitle>
            From personal studios to team collaboration, ColDAW provides a seamless creative experience, bringing music production into a new era of collaboration.
          </SectionSubtitle>
          
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>
                <Layers />
              </FeatureIcon>
              <FeatureTitle>Quick DAW Project Import</FeatureTitle>
              <FeatureDescription>
                Support for mainstream DAW formats with one-click import of existing projects, maintaining all tracks, effects, and automation parameters intact.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <Sparkles />
              </FeatureIcon>
              <FeatureTitle>Intelligent Version Control</FeatureTitle>
              <FeatureDescription>
                Automatically track every modification and intelligently merge conflicting versions, freeing team collaboration from version chaos and file loss.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <Users />
              </FeatureIcon>
              <FeatureTitle>Real-time Collaboration</FeatureTitle>
              <FeatureDescription>
                Multiple musicians can work on the same project simultaneously, with live sync and conflict resolution for seamless teamwork.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <Volume2 />
              </FeatureIcon>
              <FeatureTitle>Cross-Platform Compatibility</FeatureTitle>
              <FeatureDescription>
                Works seamlessly with Logic Pro, Ableton Live, Pro Tools, and other major DAWs, preserving your existing workflow.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <Music />
              </FeatureIcon>
              <FeatureTitle>Project History & Backup</FeatureTitle>
              <FeatureDescription>
                Complete project history with automatic backups and rollback capabilities, ensuring you never lose your creative work.
              </FeatureDescription>
            </FeatureCard>
            
          </FeaturesGrid>
        </FeaturesSection>

        <Footer>
          <p>&copy; 2024 colDAW. Bringing collaborative music production to the modern age.</p>
        </Footer>
      </LandingContainer>
  );
};

export default LandingPage;