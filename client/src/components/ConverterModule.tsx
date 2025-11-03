import React from 'react';
import styled from 'styled-components';

// Import icon images
import TDIcon from '../img/td.svg';
import MaxIcon from '../img/max.svg';
import DAWIcon from '../img/daw.svg';

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
  background: transparent;
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
  
  /* Edge gradient background - only bottom left corner and bottom */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60%;
    height: 60%;
    background: radial-gradient(
      ellipse at bottom left,
      rgba(210, 77, 195, 0.3) 0%,
      rgba(183, 112, 252, 0.2) 35%,
      rgba(137, 170, 248, 0.1) 70%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 0;
  }
  
  /* Hover effect - brighter gradient at bottom */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0%;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(183, 112, 252, 0.15) 50%,
      rgba(210, 77, 195, 0.2) 100%
    );
    transition: height 0.3s ease;
    pointer-events: none;
    z-index: 0;
  }
  
  /* Icon and text positioning */
  img {
    width: 24px;
    height: 24px;
    filter: brightness(1.2) saturate(1.1);
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
  
  &:hover {
    border-color: rgba(183, 112, 252, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(183, 112, 252, 0.15);
  }
  
  &:hover::after {
    height: 40%;
  }
  
  &:hover img {
    transform: scale(1.1);
    filter: brightness(1.3) saturate(1.2) drop-shadow(0 2px 8px rgba(183, 112, 252, 0.3));
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
      <Title>Quick Convert</Title>
      <ButtonsContainer>
        <ConverterButton
          onClick={() => handleConverterClick('daw-to-touchdesigner')}
          title="Convert DAW format to TouchDesigner"
        >
          <img src={TDIcon} alt="TouchDesigner" />
          <span>DAW to TouchDesigner</span>
        </ConverterButton>
        
        <ConverterButton
          onClick={() => handleConverterClick('daw-to-maxmsp')}
          title="Convert DAW format to MaxMSP"
        >
          <img src={MaxIcon} alt="MaxMSP" />
          <span>DAW to MaxMSP</span>
        </ConverterButton>
        
        <ConverterButton
          onClick={() => handleConverterClick('daw-to-daw')}
          title="Convert between different DAW formats"
        >
          <img src={DAWIcon} alt="DAW" />
          <span>DAW to DAW</span>
        </ConverterButton>
      </ButtonsContainer>
    </Container>
  );
};

export default ConverterModule;
