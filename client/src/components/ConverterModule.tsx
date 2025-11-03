import React from 'react';
import styled from 'styled-components';
import { Box, Music, Wand2 } from 'lucide-react';

interface ConverterModuleProps {
  onConverterSelect?: (converterType: string) => void;
}

const Container = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const ConverterButton = styled.button`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Hover background effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(183, 112, 252, 0.1) 50%,
      transparent 100%
    );
    transition: left 0.5s ease;
    z-index: 0;
  }
  
  /* Icon and text positioning */
  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.colors.primary};
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    border-color: rgba(183, 112, 252, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(183, 112, 252, 0.15);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover svg {
    transform: scale(1.1);
    filter: drop-shadow(0 2px 8px rgba(183, 112, 252, 0.3));
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const ConverterModule: React.FC<ConverterModuleProps> = ({ onConverterSelect }) => {
  const handleConverterClick = (converterType: string) => {
    if (onConverterSelect) {
      onConverterSelect(converterType);
    }
    console.log(`Selected converter: ${converterType}`);
  };

  return (
    <Container>
      <Title>Converter</Title>
      <ButtonsContainer>
        <ConverterButton
          onClick={() => handleConverterClick('daw-to-touchdesigner')}
          title="Convert DAW format to TouchDesigner"
        >
          <Box size={24} />
          <span>DAW to TouchDesigner</span>
        </ConverterButton>
        
        <ConverterButton
          onClick={() => handleConverterClick('daw-to-maxmsp')}
          title="Convert DAW format to MaxMSP"
        >
          <Wand2 size={24} />
          <span>DAW to MaxMSP</span>
        </ConverterButton>
        
        <ConverterButton
          onClick={() => handleConverterClick('daw-to-daw')}
          title="Convert between different DAW formats"
        >
          <Music size={24} />
          <span>DAW to DAW</span>
        </ConverterButton>
      </ButtonsContainer>
    </Container>
  );
};

export default ConverterModule;
