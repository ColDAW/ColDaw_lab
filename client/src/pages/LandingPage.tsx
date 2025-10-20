import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Play, Download
} from 'lucide-react';
import thumbnail from '../img/landing_page/thumbnail.jpg';
import daw1 from '../img/landing_page/1.jpg';
import daw2 from '../img/landing_page/2.jpg';
import daw3 from '../img/landing_page/3.jpg';
import daw4 from '../img/landing_page/4.jpg';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
  font-family: 'Poppins', sans-serif;
  margin: 0;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.8);
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
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
    transform: translateY(-1px);
  }
`;

const HeroSection = styled.section`
  padding: 8rem 1rem 2rem;
  background: #0a0a0a;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 6rem 1rem 2rem;
  }
`;

const HeroContent = styled.div`
  max-width: 1400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 0;
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 480;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: rgba(211, 211, 211, 1);
  line-height: 1.2;
  letter-spacing: -0.03em;
  max-width: 1000px;
  width: 100%;
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  color: #838383ff;
  margin-bottom: 1.6rem;
  max-width: 800px;
  line-height: 1.6;
  font-weight: 200;
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 98%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  object-fit: cover;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 0rem;
`;

const PrimaryButton = styled.button`
  background: #ffffff;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 6px;
  color: #0a0a0a;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  /* Apple Intelligence style gradient - Layer 1 (leftmost, widest wave) */
  &::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 5%;
    width: 48%;
    height: 0%;
    background-image: linear-gradient(
      0deg,
      rgba(137, 170, 248, 1) 0%,
      rgba(163, 141, 250, 1) 18%,
      rgba(183, 112, 252, 1) 35%,
      rgba(197, 94, 223, 0.85) 52%,
      rgba(210, 77, 195, 0.55) 68%,
      rgba(210, 77, 195, 0.28) 82%,
      rgba(210, 77, 195, 0.10) 94%,
      rgba(210, 77, 195, 0) 100%
    );
    filter: blur(40px);
    opacity: 0;
    transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.4s ease-out;
    transition-delay: 0s;
    pointer-events: none;
    z-index: -1;
  }
  
  /* Layer 2 (center-left, tall wave) */
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 25%;
    width: 42%;
    height: 0%;
    background-image: linear-gradient(
      0deg,
      rgba(183, 112, 252, 1) 0%,
      rgba(197, 94, 223, 1) 22%,
      rgba(210, 77, 195, 1) 40%,
      rgba(221, 81, 145, 0.88) 56%,
      rgba(232, 85, 96, 0.62) 70%,
      rgba(232, 85, 96, 0.32) 82%,
      rgba(232, 85, 96, 0.12) 92%,
      rgba(232, 85, 96, 0) 100%
    );
    filter: blur(40px);
    opacity: 0;
    transition: height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.45s ease-out;
    transition-delay: 0.06s;
    pointer-events: none;
    z-index: -1;
  }
  
  &:hover::before {
    height: 400%;
    opacity: 1;
  }
  
  &:hover::after {
    height: 410%;
    opacity: 1;
  }
  
  /* Ensure content is above the gradient */
  > * {
    position: relative;
    z-index: 2;
    transition: color 0.3s ease;
  }
  
  &:hover {
    background: transparent;
    transform: translateY(-1px);
    color: #ffffff;
    
    > * {
      color: #ffffff;
    }
  }
`;

/* Additional gradient layers for dynamic wave effect on PrimaryButton */
const ButtonGradientLayer3 = styled.span`
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 26%;
  height: 0%;
  background-image: linear-gradient(
    0deg,
    rgba(210, 77, 195, 1) 0%,
    rgba(221, 81, 145, 1) 20%,
    rgba(232, 85, 96, 1) 38%,
    rgba(235, 104, 81, 0.85) 54%,
    rgba(238, 123, 107, 0.58) 68%,
    rgba(238, 123, 107, 0.30) 80%,
    rgba(238, 123, 107, 0.10) 92%,
    rgba(238, 123, 107, 0) 100%
  );
  filter: blur(22px);
  opacity: 0;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.4s ease-out;
  transition-delay: 0.04s;
  pointer-events: none;
  z-index: -1;
  
  ${PrimaryButton}:hover & {
    height: 400%;
    opacity: 1;
  }
`;

const ButtonGradientLayer4 = styled.span`
  position: absolute;
  bottom: -10px;
  right: 8%;
  width: 30%;
  height: 0%;
  background-image: linear-gradient(
    0deg,
    rgba(232, 85, 96, 1) 0%,
    rgba(235, 104, 81, 1) 24%,
    rgba(238, 123, 107, 1) 44%,
    rgba(241, 142, 127, 0.88) 60%,
    rgba(245, 161, 147, 0.62) 74%,
    rgba(245, 161, 147, 0.30) 86%,
    rgba(245, 161, 147, 0.08) 95%,
    rgba(245, 161, 147, 0) 100%
  );
  filter: blur(40px);
  opacity: 0;
  transition: height 0.65s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.43s ease-out;
  transition-delay: 0.09s;
  pointer-events: none;
  z-index: -1;
  
  ${PrimaryButton}:hover & {
    height: 405%;
    opacity: 1;
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
`;

// Composition Section (卡片区域)
const CompositionSection = styled.section`
  padding: 4rem 2rem 1rem;
  background: #0a0a0a;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CompositionDescription = styled.p`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #e0e0e0;
  max-width: 900px;
  line-height: 1.5;
  margin: 6rem auto 1rem;
  padding: 0 2rem;
  letter-spacing: -0.01em;
`;

const ClipCardsContainer = styled.div<{ $isVisible: boolean }>`
  width: 100%;
  max-width: 1600px;
  height: 360px;
  position: relative;
  margin: 2rem 0;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: auto;
    min-height: 0;
    padding: 0 0.5rem;
  }
`;

const ClipCard = styled.div<{ 
  $finalX: number; 
  $finalY: number; 
  $width: number;
  $initialX: number;
  $initialY: number;
  $delay: number;
  $isVisible: boolean;
  $isRemoving?: boolean;
}>`
  position: absolute;
  width: ${props => props.$width}px;
  height: 70px;
  @media (max-width: 768px) {
    position: static !important;
    width: ${props => Math.floor(props.$width * 0.7)}px !important;
    min-width: 90px;
    max-width: 200px;
    height: 50px;
    left: unset !important;
    top: unset !important;
    margin: 0.3rem 0;
    transform: none !important;
    opacity: 1 !important;
    z-index: 1;
    padding: 0.6rem 0.4rem;
    border-radius: 12px;
  }
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  will-change: transform, opacity;
  
  /* 初始状态和移除状态 */
  left: ${props => props.$finalX}px;
  top: ${props => props.$finalY}px;
  transform: ${props => {
    if (props.$isRemoving) {
      return 'translate(0, 0) scale(0.8)';
    }
    return props.$isVisible 
      ? 'translate(0, 0) scale(1)' 
      : `translate(${props.$initialX - props.$finalX}px, ${props.$initialY - props.$finalY}px) scale(1.15)`;
  }};
  opacity: ${props => props.$isRemoving ? 0 : (props.$isVisible ? 1 : 0)};
  @media (max-width: 768px) {
    left: unset !important;
    top: unset !important;
    transform: none !important;
    opacity: 1 !important;
  }
  
  /* 动画过渡 - 慢速吸附效果（无弹跳） */
  transition: 
    left 0.6s cubic-bezier(0.23, 1, 0.32, 1),
    top 0.6s cubic-bezier(0.23, 1, 0.32, 1),
    transform 1.2s cubic-bezier(0.23, 1, 0.32, 1) ${props => props.$delay}s,
    opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${props => props.$delay}s,
    width 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:hover {
  transform: translate(0, -4px) scale(1.02) !important;
  /* box-shadow 在 style 属性中动态设置 */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
        box-shadow 0.3s ease !important;
  z-index: 10;
  }
`;

// 卡片角标
const CardBadge = styled.div<{ $type: 'add' | 'remove' | 'modify' }>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  z-index: 5;
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: badgePulse 2s ease-in-out infinite;
  
  ${props => {
    switch(props.$type) {
      case 'add':
        return `
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(76, 175, 80, 0.7) 100%);
          color: #fff;
        `;
      case 'remove':
        return `
          background: linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(244, 67, 54, 0.7) 100%);
          color: #fff;
        `;
      case 'modify':
        return `
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.9) 0%, rgba(255, 152, 0, 0.7) 100%);
          color: #fff;
        `;
    }
  }}
  
  @keyframes badgePulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 currentColor;
    }
    50% {
      transform: scale(1.1);
      box-shadow: 0 0 0 4px transparent;
    }
  }
`;

const ClipCardContent = styled.div`
  width: 100%;
`;

const ClipCardTitle = styled.h3`
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Features Section
const FeaturesSection = styled.section`
  background: #0a0a0a;
  padding: 8rem 2rem;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 400;
  text-align: center;
  margin-bottom: 1rem;
  color: #ffffff;
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
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  margin: 0 auto;
  max-width: 1200px;
  
  @media (max-width: 768px) {
    gap: 3rem;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FeatureImage = styled.img`
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #ffffff;
  line-height: 1.3;
  max-width: 800px;
`;

const FeatureDescription = styled.p`
  color: #aaa;
  line-height: 1.6;
  font-size: 1rem;
  max-width: 800px;
`;

const Footer = styled.footer`
  background: #0a0a0a;
  padding: 4rem 2rem 3rem;
  text-align: center;
  border-top: 1px solid #333;
  
  p {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }
`;

// 下载弹窗样式
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
`;

const ModalTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 500;
`;

const ModalDescription = styled.p`
  color: #aaa;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  
  @media (min-width: 480px) {
    flex-direction: row;
  }
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  
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
      background: #2a2a2a;
      border-color: #555;
    }
  `}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #ffffff;
  }
`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [cardsVisible, setCardsVisible] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const compositionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // 定义卡片类型
  type CardData = {
    id: string;
    title: string;
    color: string;
    width: number;
    row: number;
    col: number;
    badge?: 'add' | 'remove' | 'modify';
    waveformSeed?: number;
  };

  // 初始卡片数据
  const initialCardsData: CardData[] = [
    // Piano 轨道
    { id: 'p0', title: "piano", color: "#4CAF50", width: 320, row: 0, col: 0, waveformSeed: 1234 },
    { id: 'p1', title: "piano", color: "#4CAF50", width: 260, row: 0, col: 1, waveformSeed: 5678 },
    { id: 'p2', title: "piano", color: "#4CAF50", width: 380, row: 0, col: 2, waveformSeed: 9012 },
    { id: 'p3', title: "piano", color: "#4CAF50", width: 290, row: 0, col: 3, waveformSeed: 3421 },
    
    // Vocal 轨道
    { id: 'v0', title: "Vocal", color: "#2196F3", width: 400, row: 1, col: 0, waveformSeed: 3456 },
    { id: 'v1', title: "Vocal", color: "#2196F3", width: 330, row: 1, col: 1, waveformSeed: 7890 },
    { id: 'v2', title: "Vocal", color: "#2196F3", width: 280, row: 1, col: 2, waveformSeed: 5432 },
    
    // Texture 轨道
    { id: 't0', title: "Texture", color: "#9C27B0", width: 270, row: 2, col: 0, waveformSeed: 2345 },
    { id: 't1', title: "Texture", color: "#9C27B0", width: 350, row: 2, col: 1, waveformSeed: 6789 },
    { id: 't2', title: "Texture", color: "#9C27B0", width: 310, row: 2, col: 2, waveformSeed: 1357 },
    { id: 't3', title: "Texture", color: "#9C27B0", width: 340, row: 2, col: 3, waveformSeed: 8765 },
    
    // Bass 轨道
    { id: 'b0', title: "Bass", color: "#FF9800", width: 300, row: 3, col: 0, waveformSeed: 2468 },
    { id: 'b1', title: "Bass", color: "#FF9800", width: 360, row: 3, col: 1, waveformSeed: 8024 },
    { id: 'b2', title: "Bass", color: "#FF9800", width: 320, row: 3, col: 2, waveformSeed: 4567 },
  ];

  const [clipCardsData, setClipCardsData] = useState<CardData[]>(initialCardsData);
  const [removingCards, setRemovingCards] = useState<Set<string>>(new Set());
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 动态修改卡片的函数
  useEffect(() => {
    if (!cardsVisible) return;

    const performRandomAction = () => {
      const actions = ['add', 'remove', 'modify'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      setClipCardsData(prevCards => {
        const newCards = [...prevCards];
        
        if (action === 'add') {
          // 随机选择一行添加卡片
          const targetRow = Math.floor(Math.random() * 4);
          const rowCards = newCards.filter(c => c.row === targetRow).sort((a, b) => a.col - b.col);
          const insertCol = Math.floor(Math.random() * (rowCards.length + 1));
          
          // 获取该行的颜色和标题
          const rowColors = {
            0: { title: 'piano', color: '#4CAF50' },
            1: { title: 'Vocal', color: '#2196F3' },
            2: { title: 'Texture', color: '#9C27B0' },
            3: { title: 'Bass', color: '#FF9800' }
          };
          const { title, color } = rowColors[targetRow as keyof typeof rowColors];
          
          const newCard: CardData = {
            id: `${title[0]}${Date.now()}`,
            title,
            color,
            width: 250 + Math.floor(Math.random() * 200),
            row: targetRow,
            col: insertCol,
            badge: 'add',
            waveformSeed: Math.floor(Math.random() * 10000)
          };
          
          // 重新分配该行所有卡片的col值，确保连续且无重叠
          newCards.forEach(card => {
            if (card.row === targetRow && card.col >= insertCol) {
              card.col += 1;
            }
          });
          
          newCards.push(newCard);
          
          // 2秒后移除角标
          setTimeout(() => {
            setClipCardsData(cards => 
              cards.map(c => c.id === newCard.id ? { ...c, badge: undefined } : c)
            );
          }, 2000);
          
        } else if (action === 'remove') {
          // 检查每行至少保留1个卡片
          const removableCards = newCards.filter(c => {
            if (c.badge) return false; // 有角标的不删
            const rowCards = newCards.filter(card => card.row === c.row);
            return rowCards.length > 1; // 该行有多于1个卡片才可删
          });
          
          if (removableCards.length > 0) {
            const cardToRemove = removableCards[Math.floor(Math.random() * removableCards.length)];
            
            // 标记为删除
            const index = newCards.findIndex(c => c.id === cardToRemove.id);
            if (index !== -1) {
              newCards[index] = { ...newCards[index], badge: 'remove' };
              
              // 添加到移除列表
              setRemovingCards(prev => new Set(prev).add(cardToRemove.id));
              
              // 1秒后真正删除
              setTimeout(() => {
                setClipCardsData(cards => {
                  const filtered = cards.filter(c => c.id !== cardToRemove.id);
                  
                  // 重新分配该行所有卡片的col值，确保连续且无间隙
                  const targetRow = cardToRemove.row;
                  const rowCardsAfterRemoval = filtered
                    .filter(c => c.row === targetRow)
                    .sort((a, b) => a.col - b.col);
                  
                  // 重新分配col值，从0开始连续分配
                  rowCardsAfterRemoval.forEach((c, idx) => {
                    c.col = idx;
                  });
                  
                  return filtered;
                });
                setRemovingCards(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(cardToRemove.id);
                  return newSet;
                });
              }, 1000);
            }
          }
          
        } else if (action === 'modify') {
          // 随机修改一个卡片的波形
          const modifiableCards = newCards.filter(c => !c.badge);
          if (modifiableCards.length > 0) {
            const cardToModify = modifiableCards[Math.floor(Math.random() * modifiableCards.length)];
            const index = newCards.findIndex(c => c.id === cardToModify.id);
            
            if (index !== -1) {
              // 生成一个与原来不同的随机种子
              let newSeed;
              do {
                newSeed = Math.floor(Math.random() * 10000);
              } while (newSeed === (cardToModify.waveformSeed || 0));
              
              newCards[index] = {
                ...newCards[index],
                badge: 'modify',
                waveformSeed: newSeed
              };
              
              // 2秒后移除角标
              setTimeout(() => {
                setClipCardsData(cards =>
                  cards.map(c => c.id === cardToModify.id ? { ...c, badge: undefined } : c)
                );
              }, 2000);
            }
          }
        }
        
        return newCards;
      });
      
      // 随机间隔1-2秒执行下一次操作 (更频繁)
      const nextDelay = 1000 + Math.random() * 1000;
      animationTimerRef.current = setTimeout(performRandomAction, nextDelay);
    };
    
    // 首次延迟2秒后开始
    animationTimerRef.current = setTimeout(performRandomAction, 2000);
    
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [cardsVisible]);

  const handleGetStarted = () => {
    navigate('/editor');
  };

  const handleDownloadVST = () => {
    // 提示用户VST插件下载
    const confirmDownload = window.confirm(
      'ColDAW VST Plugin will be downloaded. Make sure to:\n\n' +
      '1. Install the plugin in your DAW\'s VST3 folder\n' +
      '2. Restart your DAW after installation\n' +
      '3. Look for "ColDaw Export" in your plugins list\n\n' +
      'Continue with download?'
    );
    
    if (confirmDownload) {
      // 创建下载链接
      const link = document.createElement('a');
      // 指向实际的VST文件路径（需要在public文件夹中或服务器上）
      link.href = '/downloads/ColDaw-Export.vst3.zip'; 
      link.download = 'ColDaw-Export-VST3.zip';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 显示安装指导
      setTimeout(() => {
        alert(
          'VST Plugin downloaded!\n\n' +
          'Installation Instructions:\n' +
          '• Windows: Extract to C:\\Program Files\\Common Files\\VST3\\\n' +
          '• macOS: Extract to /Library/Audio/Plug-Ins/VST3/\n' +
          '• Or use your DAW\'s preferred VST3 folder\n\n' +
          'Restart your DAW and look for "ColDaw Export" in your plugins.'
        );
      }, 500);
    }
  };

  const handleInstallPWA = async () => {
    setShowDownloadModal(false);
    
    try {
      // 检查是否已经安装PWA
      if (window.matchMedia('(display-mode: standalone)').matches) {
        alert('ColDAW Editor is already installed on your device!');
        return;
      }

      // 触发PWA安装提示
      const beforeInstallPrompt = (window as any).deferredPrompt;
      if (beforeInstallPrompt) {
        beforeInstallPrompt.prompt();
        const { outcome } = await beforeInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          alert('ColDAW Editor installed successfully! Look for it on your desktop or app menu.');
        } else {
          alert('Installation cancelled. You can install it later from the browser menu.');
        }
        (window as any).deferredPrompt = null;
      } else {
        // 如果没有安装提示，显示手动安装指导
        const browserName = navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                           navigator.userAgent.includes('Safari') ? 'Safari' : 
                           navigator.userAgent.includes('Firefox') ? 'Firefox' : 'your browser';
        
        alert(
          `To install ColDAW Editor on ${browserName}:\n\n` +
          `• Chrome: Click the menu (⋮) → "Install ColDAW Editor"\n` +
          `• Safari: Click Share → "Add to Home Screen"\n` +
          `• Firefox: Look for the install icon in the address bar\n\n` +
          `Or bookmark this page for quick access!`
        );
      }
    } catch (error) {
      console.error('PWA installation error:', error);
      alert('Installation failed. Please try installing manually from your browser menu.');
    }
  };

  // 计算每个卡片的最终位置和初始位置
  const calculateCardPositions = (card: CardData) => {
    const rowHeight = 70;
    const rowGap = 16;
    const colGap = 16;
    const containerWidth = 1600;
    
    // 计算该行所有卡片，按col排序
    const rowCards = clipCardsData
      .filter(c => c.row === card.row)
      .sort((a, b) => a.col - b.col);
    
    const totalWidth = rowCards.reduce((sum, c) => sum + c.width, 0) + colGap * (rowCards.length - 1);
    
    // 行起始X位置（居中）
    let rowStartX = (containerWidth - totalWidth) / 2;
    
    // 根据行数偏移，让每行有不同的起始位置
    if (card.row === 0) rowStartX -= 100;
    if (card.row === 1) rowStartX += 150;
    if (card.row === 2) rowStartX -= 50;
    
    // 计算当前卡片的最终X位置 - 严格按照col顺序累加
    let finalX = rowStartX;
    const cardIndex = rowCards.findIndex(c => c.id === card.id);
    
    for (let i = 0; i < cardIndex; i++) {
      finalX += rowCards[i].width + colGap;
    }
    
    const finalY = 50 + card.row * (rowHeight + rowGap);
    
    // 计算初始位置偏移 - 从目标位置的方向进入
    // 根据卡片在容器中的相对位置决定进入方向
    const centerX = containerWidth / 2;
    const centerY = 300; // 容器中心Y
    
    let offsetX: number;
    let offsetY: number;
    
    // 根据卡片相对于中心的位置，从对应方向进入
    const isLeft = finalX < centerX - 200;
    const isRight = finalX > centerX + 200;
    const isTop = finalY < centerY - 100;
    const isBottom = finalY > centerY + 100;
    
    // 计算偏移距离（从目标位置偏移）
    const distance = 400; // 增加距离让动画更明显
    
    if (isLeft && isTop) {
      // 左上区域 - 从左上方向进入
      offsetX = -distance * 0.8;
      offsetY = -distance * 0.6;
    } else if (isRight && isTop) {
      // 右上区域 - 从右上方向进入
      offsetX = distance * 0.8;
      offsetY = -distance * 0.6;
    } else if (isLeft && isBottom) {
      // 左下区域 - 从左下方向进入
      offsetX = -distance * 0.8;
      offsetY = distance * 0.6;
    } else if (isRight && isBottom) {
      // 右下区域 - 从右下方向进入
      offsetX = distance * 0.8;
      offsetY = distance * 0.6;
    } else if (isLeft) {
      // 左边 - 从左边进入
      offsetX = -distance;
      offsetY = 0;
    } else if (isRight) {
      // 右边 - 从右边进入
      offsetX = distance;
      offsetY = 0;
    } else if (isTop) {
      // 上边 - 从上边进入
      offsetX = 0;
      offsetY = -distance;
    } else {
      // 下边 - 从下边进入
      offsetX = 0;
      offsetY = distance;
    }
    
    const initialX = finalX + offsetX;
    const initialY = finalY + offsetY;
    
    // 计算延迟 - 更慢的递进效果
    const delay = card.row * 0.12 + card.col * 0.1;
    
    return { finalX, finalY, initialX, initialY, delay };
  };

  // 使用 IntersectionObserver 检测卡片容器是否进入视口
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !cardsVisible) {
            setCardsVisible(true);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px',
      }
    );

    if (cardsContainerRef.current) {
      observer.observe(cardsContainerRef.current);
    }

    return () => {
      if (cardsContainerRef.current) {
        observer.unobserve(cardsContainerRef.current);
      }
    };
  }, [cardsVisible]);

  // PWA安装提示监听器
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <PageContainer>
      <Header>
        <Nav>
          <Logo>ColDAW</Logo>
          <NavLinks>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#documentation">Documentation</NavLink>
            <NavLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setShowDownloadModal(true);
              }}
            >
              Download
            </NavLink>
            
          </NavLinks>
          <CTAButton onClick={handleGetStarted}>Editor</CTAButton>
        </Nav>
      </Header>

      <HeroSection>
        <HeroContent>
          <HeroTitle>Reimagining Music Collaboration — Your Studio in the Cloud.</HeroTitle>
          <HeroSubtitle>
            CoDAW connects your favorite DAWs to a cloud-based version control system. Built for music creators and multi-media teams.
          </HeroSubtitle>
          
          <HeroButtons>
            <PrimaryButton onClick={handleGetStarted}>
              <ButtonGradientLayer3 />
              <ButtonGradientLayer4 />
              <Play size={18} />
              Start Creating
            </PrimaryButton>
            <SecondaryButton onClick={handleDownloadVST}>
              <Download size={18} />
              Download Plugin
            </SecondaryButton>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      <VideoContainer>
        <HeroImage 
          src={thumbnail}
          alt="ColDAW Interface Preview"
        />
      </VideoContainer>

      <CompositionDescription>
        Transform your creative workflow with our powerful track management tool that works with your favorite DAWs. 
        Organize music projects, collaborate seamlessly, and maintain perfect synchronization.
      </CompositionDescription>

      <CompositionSection ref={compositionRef}>
        {/* 桌面端：原有绝对定位动画，移动端：分轨横排 */}
        <ClipCardsContainer ref={cardsContainerRef} $isVisible={cardsVisible}>
          {/* 桌面端渲染所有卡片，移动端分轨渲染 */}
          {/* 移动端分轨横排渲染 */}
          {Array.from({ length: 4 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="daw-track-row"
            >
              {clipCardsData.filter(card => card.row === rowIdx).map(card => {
                const { finalX, finalY, initialX, initialY, delay } = calculateCardPositions(card);
                const isRemoving = removingCards.has(card.id);
                return (
                  <ClipCard
                    key={card.id}
                    $finalX={finalX}
                    $finalY={finalY}
                    $initialX={initialX}
                    $initialY={initialY}
                    $width={card.width}
                    $delay={delay}
                    $isVisible={cardsVisible}
                    $isRemoving={isRemoving}
                    style={{
                      background: `linear-gradient(135deg, ${card.color}60 0%, ${card.color}30 100%)`,
                      borderColor: `${card.color}80`,
                      boxShadow: `0 0 16px 2px ${card.color}22, 0 0 32px 4px ${card.color}11, 0 0 0px 0px #0000`
                    }}
                  >
                    {card.badge && (
                      <CardBadge $type={card.badge}>
                        {card.badge === 'add' && '+'}
                        {card.badge === 'remove' && '−'}
                        {card.badge === 'modify' && '✦'}
                      </CardBadge>
                    )}
                    <ClipCardContent>
                      <ClipCardTitle>{card.title}</ClipCardTitle>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '18px',
                        gap: '1.2px',
                        overflow: 'hidden',
                        width: '100%'
                      }}>
                        {Array.from({length: Math.max(15, Math.floor(Math.min(card.width * 0.7, 180) / 2.8))}, (_, i) => {
                          // 移动端波形渲染，缩小卡片后调整波形密度和数量
                          const baseSeed = card.waveformSeed || Math.abs(card.id.charCodeAt(0) * 1000 + card.id.charCodeAt(1) * 100);
                          const time = i * 2;
                          const envelope = Math.sin((baseSeed + time) * 0.02) * 0.7 + 0.8;
                          const fundamental = Math.sin((baseSeed + time) * 0.3) * 0.65;
                          const harmonic2 = Math.sin((baseSeed + time) * 0.6 + 0.3) * 0.4;
                          const harmonic3 = Math.sin((baseSeed + time) * 0.9 + 0.6) * 0.3;
                          const harmonic4 = Math.sin((baseSeed + time) * 1.2 + 0.9) * 0.22;
                          const midFreq1 = Math.sin((baseSeed + time) * 0.45 + 1.2) * 0.35;
                          const midFreq2 = Math.sin((baseSeed + time) * 0.7 + 1.8) * 0.28;
                          const highDetail = Math.sin((baseSeed + time) * 2.0 + 2.4) * 0.18;
                          const noise = Math.sin((baseSeed + time) * 10.5 + 3.3) * 0.15;
                          const extra1 = Math.sin((baseSeed + time) * 0.8 + 4.5) * 0.25;
                          const extra2 = Math.sin((baseSeed + time) * 1.5 + 5.2) * 0.2;
                          const timeSignal = fundamental + harmonic2 + harmonic3 + harmonic4 + midFreq1 + midFreq2 + highDetail + noise + extra1 + extra2;
                          const modulatedSignal = timeSignal * envelope;
                          const normalized = (modulatedSignal + 1) / 4.0;
                          const compressed = Math.pow(Math.max(0, Math.min(1, normalized)), 0.45);
                          const silenceThreshold = 0.05;
                          const finalAmplitude = compressed < silenceThreshold ? compressed * 0.2 : compressed;
                          const height = Math.max(2, 1 + finalAmplitude * 16); // 移动端更小的波形高度
                          return (
                            <div
                              key={i}
                              style={{
                                width: '1.2px',
                                height: `${height}px`,
                                background: 'rgba(255, 255, 255, 0.4)',
                                borderRadius: '0.4px',
                                transition: 'height 0.4s ease-out',
                                flexShrink: 0
                              }}
                            />
                          );
                        })}
                      </div>
                    </ClipCardContent>
                  </ClipCard>
                );
              })}
            </div>
          ))}
          {/* 桌面端原有绝对定位动画卡片 */}
          <div className="daw-desktop-cards">
            {clipCardsData.map((card) => {
              const { finalX, finalY, initialX, initialY, delay } = calculateCardPositions(card);
              const isRemoving = removingCards.has(card.id);
              return (
                <ClipCard
                  key={card.id}
                  $finalX={finalX}
                  $finalY={finalY}
                  $initialX={initialX}
                  $initialY={initialY}
                  $width={card.width}
                  $delay={delay}
                  $isVisible={cardsVisible}
                  $isRemoving={isRemoving}
                  style={{
                    background: `linear-gradient(135deg, ${card.color}60 0%, ${card.color}30 100%)`,
                    borderColor: `${card.color}80`,
                    boxShadow: `0 0 16px 2px ${card.color}22, 0 0 32px 4px ${card.color}11, 0 0 0px 0px #0000`
                  }}
                >
                  {card.badge && (
                    <CardBadge $type={card.badge}>
                      {card.badge === 'add' && '+'}
                      {card.badge === 'remove' && '−'}
                      {card.badge === 'modify' && '✦'}
                    </CardBadge>
                  )}
                  <ClipCardContent>
                    <ClipCardTitle>{card.title}</ClipCardTitle>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '26px',
                      gap: '1.8px',
                      overflow: 'hidden',
                      width: '100%'
                    }}>
                      {Array.from({length: Math.max(30, Math.floor(card.width / 3.2))}, (_, i) => {
                        // 桌面端波形渲染，至少显示30个波形条
                        const baseSeed = card.waveformSeed || Math.abs(card.id.charCodeAt(0) * 1000 + card.id.charCodeAt(1) * 100);
                        const time = i * 2;
                        const envelope = Math.sin((baseSeed + time) * 0.02) * 0.7 + 0.8;
                        const fundamental = Math.sin((baseSeed + time) * 0.3) * 0.65;
                        const harmonic2 = Math.sin((baseSeed + time) * 0.6 + 0.3) * 0.4;
                        const harmonic3 = Math.sin((baseSeed + time) * 0.9 + 0.6) * 0.3;
                        const harmonic4 = Math.sin((baseSeed + time) * 1.2 + 0.9) * 0.22;
                        const midFreq1 = Math.sin((baseSeed + time) * 0.45 + 1.2) * 0.35;
                        const midFreq2 = Math.sin((baseSeed + time) * 0.7 + 1.8) * 0.28;
                        const highDetail = Math.sin((baseSeed + time) * 2.0 + 2.4) * 0.18;
                        const noise = Math.sin((baseSeed + time) * 10.5 + 3.3) * 0.15;
                        const extra1 = Math.sin((baseSeed + time) * 0.8 + 4.5) * 0.25;
                        const extra2 = Math.sin((baseSeed + time) * 1.5 + 5.2) * 0.2;
                        const timeSignal = fundamental + harmonic2 + harmonic3 + harmonic4 + midFreq1 + midFreq2 + highDetail + noise + extra1 + extra2;
                        const modulatedSignal = timeSignal * envelope;
                        const normalized = (modulatedSignal + 1) / 4.0;
                        const compressed = Math.pow(Math.max(0, Math.min(1, normalized)), 0.45);
                        const silenceThreshold = 0.05;
                        const finalAmplitude = compressed < silenceThreshold ? compressed * 0.2 : compressed;
                        const height = Math.max(3, 2 + finalAmplitude * 24); // 确保最小高度为3px
                        return (
                          <div
                            key={i}
                            style={{
                              width: '1.2px',
                              height: `${height}px`,
                              background: 'rgba(255, 255, 255, 0.4)',
                              borderRadius: '0.4px',
                              transition: 'height 0.4s ease-out',
                              flexShrink: 0
                            }}
                          />
                        );
                      })}
                    </div>
                  </ClipCardContent>
                </ClipCard>
              );
            })}
          </div>
        </ClipCardsContainer>
        {/* 响应式样式：移动端分轨横排，桌面端隐藏分轨行，移动端隐藏桌面绝对定位卡片 */}
        <style>{`
          @media (max-width: 768px) {
            .daw-track-row {
              display: flex;
              flex-direction: row;
              gap: 0.3rem;
              overflow-x: auto;
              padding: 0.15rem 0.1rem;
              min-height: 60px;
              align-items: flex-start;
              width: 100vw;
              padding-left: calc(0.5rem + var(--row-offset, 0px));
            }
            .daw-track-row:nth-child(1) {
              --row-offset: 0px;
            }
            .daw-track-row:nth-child(2) {
              --row-offset: 20px;
            }
            .daw-track-row:nth-child(3) {
              --row-offset: -10px;
            }
            .daw-track-row:nth-child(4) {
              --row-offset: 15px;
            }
            .daw-desktop-cards {
              display: none !important;
            }
          }
          @media (min-width: 769px) {
            .daw-track-row {
              display: none !important;
            }
          }
        `}</style>
      </CompositionSection>

      <FeaturesSection id="features">
        <SectionTitle>Smart. Fast. Seamless.</SectionTitle>
        <SectionSubtitle>
          Break free from the chaos of file sharing and version conflicts. Experience the future of music collaboration with cloud-native project management designed for modern creators.
        </SectionSubtitle>
        
        <FeaturesGrid>
          <FeatureItem>
            <FeatureImage src={daw1} alt="DAW-like Interface" />
            <FeatureTitle>Familiar DAW Experience</FeatureTitle>
            <FeatureDescription>
              Jump right in with an interface that feels just like your favorite DAW. Full-featured workspace with all the tools you know and love.
            </FeatureDescription>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureImage src={daw2} alt="Cloud Project Management" />
            <FeatureTitle>Everything in the Cloud</FeatureTitle>
            <FeatureDescription>
              Say goodbye to scattered files and lost projects. Centralized cloud management keeps everything organized and accessible from anywhere.
            </FeatureDescription>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureImage src={daw3} alt="Version Control Interface" />
            <FeatureTitle>Never Lose Your Progress</FeatureTitle>
            <FeatureDescription>
              Branch editing, version rollback, and collaborative workflows. Keep every draft safe while enabling seamless multi-user collaboration.
            </FeatureDescription>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureImage src={daw4} alt="VST Plugin Integration" />
            <FeatureTitle>One-Click DAW Integration</FeatureTitle>
            <FeatureDescription>
              Native VST plugin for instant uploads and version syncing. Work in your DAW, sync to the cloud with a single click.
            </FeatureDescription>
          </FeatureItem>
        </FeaturesGrid>
      </FeaturesSection>

      <Footer>
        <p>&copy; 2025 ColDAW. Design by Joe Deng. </p>
      </Footer>

      {/* 下载选择弹窗 */}
      {showDownloadModal && (
        <ModalOverlay onClick={() => setShowDownloadModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowDownloadModal(false)}>×</CloseButton>
            <ModalTitle>Choose Your Download</ModalTitle>
            <ModalDescription>
              Install ColDAW Editor as a PWA for the full web experience, or download the VST plugin to integrate with your favorite DAW.
            </ModalDescription>
            <ModalButtons>
              <ModalButton $variant="primary" onClick={handleInstallPWA}>
                Install Editor PWA
              </ModalButton>
              <ModalButton $variant="secondary" onClick={() => {
                handleDownloadVST();
                setShowDownloadModal(false);
              }}>
                Download VST Plugin
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default LandingPage;
