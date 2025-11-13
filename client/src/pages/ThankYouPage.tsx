import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ContentContainer = styled.div`
  max-width: 600px;
  width: 100%;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  text-align: center;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    color: #22c55e;
    animation: scaleIn 0.5s ease-out;
  }
  
  @keyframes scaleIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Logo = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(211, 211, 211, 1);
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 600;
  color: rgba(211, 211, 211, 1);
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const Highlight = styled.span`
  color: rgba(211, 211, 211, 1);
  font-weight: 500;
`;

const InfoBox = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 1.25rem;
  margin: 2rem 0;
  text-align: left;
`;

const InfoTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #22c55e;
  margin-bottom: 0.75rem;
`;

const InfoText = styled.p`
  font-size: 0.95rem;
  color: #aaa;
  line-height: 1.6;
  margin: 0;
`;

const BetaLink = styled.div`
  background: rgba(40, 40, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #22c55e;
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const PrimaryButton = styled.button`
  background: rgba(211, 211, 211, 1);
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  color: #0a0a0a;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: #aaa;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(211, 211, 211, 1);
  }
`;

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email } = location.state || { name: 'there', email: '' };

  // Redirect to home if no state (direct access)
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <PageContainer>
      <ContentContainer>
        <IconWrapper>
          <CheckCircle size={64} />
        </IconWrapper>

        <Logo>ColDaw</Logo>
        <Title>Welcome to the Beta! 🎉</Title>
        
        <Message>
          Thank you, <Highlight>{name}</Highlight>! You're now part of our exclusive beta program.
        </Message>

        <InfoBox>
          <InfoTitle>Check Your Inbox</InfoTitle>
          <InfoText>
            We've sent a confirmation email to <Highlight>{email}</Highlight> with your beta access details and getting started guide.
          </InfoText>
        </InfoBox>

        <ButtonGroup>
          <SecondaryButton onClick={handleBackToHome}>
            Back to Home
          </SecondaryButton>
        </ButtonGroup>

        <Message style={{ fontSize: '0.85rem', marginTop: '2rem', color: '#666' }}>
          Need help? Contact us at joe.deng@coldaw.app
        </Message>
      </ContentContainer>
    </PageContainer>
  );
};

export default ThankYouPage;
