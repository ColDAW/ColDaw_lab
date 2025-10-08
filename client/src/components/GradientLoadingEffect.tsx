import styled, { keyframes } from 'styled-components';

// Animated gradient waves that flow from bottom to top with faster, more dynamic movement
const waveAnimation1 = keyframes`
  0% {
    height: 80%;
    opacity: 0.35;
    transform: translateX(0%) scale(0.85);
  }
  33% {
    height: 95%;
    opacity: 0.45;
    transform: translateX(3%) scale(0.9);
  }
  66% {
    height: 88%;
    opacity: 0.38;
    transform: translateX(-2%) scale(0.87);
  }
  100% {
    height: 80%;
    opacity: 0.35;
    transform: translateX(0%) scale(0.85);
  }
`;

const waveAnimation2 = keyframes`
  0% {
    height: 90%;
    opacity: 0.38;
    transform: translateX(0%) scale(0.88);
  }
  33% {
    height: 105%;
    opacity: 0.48;
    transform: translateX(-4%) scale(0.93);
  }
  66% {
    height: 95%;
    opacity: 0.42;
    transform: translateX(2%) scale(0.9);
  }
  100% {
    height: 90%;
    opacity: 0.38;
    transform: translateX(0%) scale(0.88);
  }
`;

const waveAnimation3 = keyframes`
  0% {
    height: 75%;
    opacity: 0.32;
    transform: translateX(0%) scale(0.82);
  }
  33% {
    height: 92%;
    opacity: 0.42;
    transform: translateX(2%) scale(0.88);
  }
  66% {
    height: 82%;
    opacity: 0.36;
    transform: translateX(-3%) scale(0.84);
  }
  100% {
    height: 75%;
    opacity: 0.32;
    transform: translateX(0%) scale(0.82);
  }
`;

const waveAnimation4 = keyframes`
  0% {
    height: 85%;
    opacity: 0.30;
    transform: translateX(0%) scale(0.86);
  }
  33% {
    height: 98%;
    opacity: 0.40;
    transform: translateX(-2%) scale(0.91);
  }
  66% {
    height: 90%;
    opacity: 0.34;
    transform: translateX(3%) scale(0.88);
  }
  100% {
    height: 85%;
    opacity: 0.30;
    transform: translateX(0%) scale(0.86);
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
  pointer-events: none;
  z-index: ${({ $fullscreen }) => ($fullscreen ? '9999' : '1')};
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
  bottom: -30px;
  left: 10%;
  width: 20%;
  height: ${({ $isActive }) => ($isActive ? '80%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(137, 170, 248, 0.45) 0%,
    rgba(163, 141, 250, 0.38) 18%,
    rgba(183, 112, 252, 0.32) 35%,
    rgba(197, 94, 223, 0.24) 52%,
    rgba(210, 77, 195, 0.16) 68%,
    rgba(210, 77, 195, 0.08) 82%,
    rgba(210, 77, 195, 0.02) 94%,
    rgba(210, 77, 195, 0) 100%
  );
  filter: blur(85px);
  opacity: ${({ $isActive }) => ($isActive ? '0.35' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation1 : 'none')} 2.2s ease-in-out infinite;
  transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.6s ease-out;
  transition-delay: 0s;
  transform-origin: center bottom;
`;

const GradientWave2 = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: -30px;
  left: 30%;
  width: 24%;
  height: ${({ $isActive }) => ($isActive ? '90%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(183, 112, 252, 0.48) 0%,
    rgba(197, 94, 223, 0.42) 22%,
    rgba(210, 77, 195, 0.36) 40%,
    rgba(221, 81, 145, 0.28) 56%,
    rgba(232, 85, 96, 0.20) 70%,
    rgba(232, 85, 96, 0.12) 82%,
    rgba(232, 85, 96, 0.04) 92%,
    rgba(232, 85, 96, 0) 100%
  );
  filter: blur(80px);
  opacity: ${({ $isActive }) => ($isActive ? '0.38' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation2 : 'none')} 2.5s ease-in-out infinite;
  transition: height 0.9s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.65s ease-out;
  transition-delay: 0.1s;
  transform-origin: center bottom;
`;

const GradientWave3 = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: -30px;
  left: 54%;
  width: 19%;
  height: ${({ $isActive }) => ($isActive ? '75%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(210, 77, 195, 0.42) 0%,
    rgba(221, 81, 145, 0.36) 20%,
    rgba(232, 85, 96, 0.30) 38%,
    rgba(235, 104, 81, 0.24) 54%,
    rgba(238, 123, 107, 0.16) 68%,
    rgba(238, 123, 107, 0.08) 80%,
    rgba(238, 123, 107, 0.02) 92%,
    rgba(238, 123, 107, 0) 100%
  );
  filter: blur(90px);
  opacity: ${({ $isActive }) => ($isActive ? '0.32' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation3 : 'none')} 2.3s ease-in-out infinite;
  transition: height 0.85s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.7s ease-out;
  transition-delay: 0.08s;
  transform-origin: center bottom;
`;

const GradientWave4 = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: -30px;
  right: 12%;
  width: 22%;
  height: ${({ $isActive }) => ($isActive ? '85%' : '0%')};
  background-image: linear-gradient(
    0deg,
    rgba(232, 85, 96, 0.40) 0%,
    rgba(235, 104, 81, 0.34) 24%,
    rgba(238, 123, 107, 0.28) 44%,
    rgba(241, 142, 127, 0.22) 60%,
    rgba(245, 161, 147, 0.14) 74%,
    rgba(245, 161, 147, 0.08) 86%,
    rgba(245, 161, 147, 0.02) 95%,
    rgba(245, 161, 147, 0) 100%
  );
  filter: blur(75px);
  opacity: ${({ $isActive }) => ($isActive ? '0.30' : '0')};
  animation: ${({ $isActive }) => ($isActive ? waveAnimation4 : 'none')} 2.6s ease-in-out infinite;
  transition: height 0.95s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.75s ease-out;
  transition-delay: 0.15s;
  transform-origin: center bottom;
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
