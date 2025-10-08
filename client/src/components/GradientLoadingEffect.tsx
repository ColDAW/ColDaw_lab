import styled, { keyframes } from 'styled-components';

// Animated gradient waves that flow from bottom to top
const waveAnimation1 = keyframes`
  0%, 100% {
    height: 120%;
    opacity: 0.85;
  }
  50% {
    height: 140%;
    opacity: 0.95;
  }
`;

const waveAnimation2 = keyframes`
  0%, 100% {
    height: 130%;
    opacity: 0.88;
  }
  50% {
    height: 150%;
    opacity: 0.98;
  }
`;

const waveAnimation3 = keyframes`
  0%, 100% {
    height: 115%;
    opacity: 0.82;
  }
  50% {
    height: 135%;
    opacity: 0.92;
  }
`;

const waveAnimation4 = keyframes`
  0%, 100% {
    height: 125%;
    opacity: 0.8;
  }
  50% {
    height: 145%;
    opacity: 0.9;
  }
`;

interface GradientContainerProps {
  $isActive: boolean;
  $fullscreen?: boolean;
}

const GradientContainer = styled.div<GradientContainerProps>`
  position: ${({ $fullscreen }) => ($fullscreen ? 'fixed' : 'absolute')};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: ${({ $isActive }) => ($isActive ? 'all' : 'none')};
  z-index: ${({ $fullscreen }) => ($fullscreen ? '9999' : '10')};
  transition: opacity 0.6s ease-out;
  opacity: ${({ $isActive }) => ($isActive ? '1' : '0')};
  
  ${({ $fullscreen, theme }) =>
    $fullscreen &&
    `
    background: ${theme.colors.bgPrimary};
  `}
`;

const GradientWave1 = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: -20px;
  left: 8%;
  width: 25%;
  height: ${({ $isActive }) => ($isActive ? '120%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(137, 170, 248, 0.88) 0%,
    rgba(163, 141, 250, 0.72) 18%,
    rgba(183, 112, 252, 0.58) 35%,
    rgba(197, 94, 223, 0.42) 52%,
    rgba(210, 77, 195, 0.26) 68%,
    rgba(210, 77, 195, 0.12) 82%,
    rgba(210, 77, 195, 0.04) 94%,
    rgba(210, 77, 195, 0) 100%
  );
  filter: blur(60px);
  opacity: ${({ $isActive }) => ($isActive ? '0.85' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation1 : 'none')} 3.5s ease-in-out infinite;
  transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.6s ease-out;
  transition-delay: 0s;
`;

const GradientWave2 = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: -20px;
  left: 28%;
  width: 30%;
  height: ${({ $isActive }) => ($isActive ? '130%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(183, 112, 252, 0.92) 0%,
    rgba(197, 94, 223, 0.78) 22%,
    rgba(210, 77, 195, 0.64) 40%,
    rgba(221, 81, 145, 0.48) 56%,
    rgba(232, 85, 96, 0.32) 70%,
    rgba(232, 85, 96, 0.18) 82%,
    rgba(232, 85, 96, 0.06) 92%,
    rgba(232, 85, 96, 0) 100%
  );
  filter: blur(58px);
  opacity: ${({ $isActive }) => ($isActive ? '0.88' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation2 : 'none')} 4s ease-in-out infinite;
  transition: height 0.9s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.65s ease-out;
  transition-delay: 0.1s;
`;

const GradientWave3 = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: -20px;
  left: 52%;
  width: 24%;
  height: ${({ $isActive }) => ($isActive ? '115%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(210, 77, 195, 0.90) 0%,
    rgba(221, 81, 145, 0.76) 20%,
    rgba(232, 85, 96, 0.62) 38%,
    rgba(235, 104, 81, 0.46) 54%,
    rgba(238, 123, 107, 0.30) 68%,
    rgba(238, 123, 107, 0.16) 80%,
    rgba(238, 123, 107, 0.05) 92%,
    rgba(238, 123, 107, 0) 100%
  );
  filter: blur(62px);
  opacity: ${({ $isActive }) => ($isActive ? '0.82' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation3 : 'none')} 3.8s ease-in-out infinite;
  transition: height 0.85s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.7s ease-out;
  transition-delay: 0.08s;
`;

const GradientWave4 = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: -20px;
  right: 10%;
  width: 28%;
  height: ${({ $isActive }) => ($isActive ? '125%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(232, 85, 96, 0.94) 0%,
    rgba(235, 104, 81, 0.80) 24%,
    rgba(238, 123, 107, 0.66) 44%,
    rgba(241, 142, 127, 0.50) 60%,
    rgba(245, 161, 147, 0.32) 74%,
    rgba(245, 161, 147, 0.16) 86%,
    rgba(245, 161, 147, 0.04) 95%,
    rgba(245, 161, 147, 0) 100%
  );
  filter: blur(56px);
  opacity: ${({ $isActive }) => ($isActive ? '0.8' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation4 : 'none')} 4.2s ease-in-out infinite;
  transition: height 0.95s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.75s ease-out;
  transition-delay: 0.15s;
`;

interface GradientLoadingEffectProps {
  isActive: boolean;
  fullscreen?: boolean;
  children?: React.ReactNode;
}

export const GradientLoadingEffect: React.FC<GradientLoadingEffectProps> = ({
  isActive,
  fullscreen = false,
  children,
}) => {
  return (
    <GradientContainer $isActive={isActive} $fullscreen={fullscreen}>
      <GradientWave1 $isActive={isActive} />
      <GradientWave2 $isActive={isActive} />
      <GradientWave3 $isActive={isActive} />
      <GradientWave4 $isActive={isActive} />
      {children}
    </GradientContainer>
  );
};

export default GradientLoadingEffect;
