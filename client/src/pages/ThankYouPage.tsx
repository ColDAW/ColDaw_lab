import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle } from 'lucide-react';
import closeIcon from '../img/close.svg';

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
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.3s ease, transform 0.2s ease;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  img {
    width: 20px;
    height: 20px;
    filter: invert(1);
  }
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
        <CloseButton onClick={handleBackToHome} aria-label="Close">
          <img src={closeIcon} alt="Close" />
        </CloseButton>
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

        <Message style={{ fontSize: '0.85rem', marginTop: '2rem', color: '#666' }}>
          Need help? Contact us at joe.deng@coldaw.app
        </Message>
      </ContentContainer>
    </PageContainer>
  );
};

export default ThankYouPage;
