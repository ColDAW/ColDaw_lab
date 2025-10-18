import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Upload, Folder, Edit2, Trash2, Copy, User, Settings } from 'lucide-react';
import { projectApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import AuthModal from '../components/AuthModal';
import ProjectThumbnailCanvas from '../components/ProjectThumbnail';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const Sidebar = styled.div`
  width: 280px;
  min-width: 280px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const SidebarContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SidebarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  margin-top: auto;
`;

const Logo = styled.div`
  font-size: 14px;
  font-weight: 400;
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const VersionBadge = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
`;

const UserSection = styled.div`
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(137, 170, 248, 1) 0%,
    rgba(183, 112, 252, 1) 25%,
    rgba(210, 77, 195, 1) 50%,
    rgba(232, 85, 96, 1) 75%,
    rgba(245, 161, 147, 1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: white;
  position: relative;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, 
      rgba(137, 170, 248, 0.8) 0%,
      rgba(183, 112, 252, 0.8) 25%,
      rgba(210, 77, 195, 0.8) 50%,
      rgba(232, 85, 96, 0.8) 75%,
      rgba(245, 161, 147, 0.8) 100%
    );
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(183, 112, 252, 0.4);
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textTertiary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AccountButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
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
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: rgba(183, 112, 252, 0.4);
    box-shadow: 0 2px 12px rgba(183, 112, 252, 0.15);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SidebarNav = styled.div`
  flex: 1;
`;

const NavItem = styled.div<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, $active }) => $active ? theme.colors.textPrimary : theme.colors.textSecondary};
  background: ${({ theme, $active }) => $active ? theme.colors.bgTertiary : 'transparent'};
  font-size: 13px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${({ $active }) => $active && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(137, 170, 248, 1) 0%,
        rgba(183, 112, 252, 1) 25%,
        rgba(210, 77, 195, 1) 50%,
        rgba(232, 85, 96, 1) 75%,
        rgba(245, 161, 147, 1) 100%
      );
      border-radius: 0 2px 2px 0;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(183, 112, 252, 0.05) 0%,
        rgba(210, 77, 195, 0.03) 50%,
        transparent 100%
      );
      pointer-events: none;
    }
  `}
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 2px;
      height: 0%;
      background: linear-gradient(
        180deg,
        rgba(183, 112, 252, 0.6) 0%,
        rgba(210, 77, 195, 0.6) 50%,
        rgba(232, 85, 96, 0.6) 100%
      );
      transform: translateY(-50%);
      transition: height 0.3s ease;
      border-radius: 0 1px 1px 0;
    }
  }
  
  &:hover::before {
    height: 70%;
  }
  
  svg {
    width: 16px;
    height: 16px;
    position: relative;
    z-index: 1;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const UploadArea = styled.div<{ $isDragging: boolean }>`
  width: 100%;
  height: 200px;
  border: 1px solid ${({ theme, $isDragging }) => 
    $isDragging ? theme.colors.accentOrange : theme.colors.borderColor};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $isDragging }) => 
    $isDragging 
      ? theme.colors.bgTertiary 
      : theme.colors.bgSecondary};
  cursor: pointer;
  transition: border-color 0.3s ease;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  
  /* Apple Intelligence style gradient - Layer 1 (leftmost, widest wave) */
  &::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 5%;
    width: 28%;
    height: 0%;
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
    opacity: 0;
    transition: height 1.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.8s ease-out;
    transition-delay: 0s;
    pointer-events: none;
    z-index: 0;
  }
  
  /* Layer 2 (center-left, tall wave) */
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 25%;
    width: 32%;
    height: 0%;
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
    opacity: 0;
    transition: height 1.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.85s ease-out;
    transition-delay: 0.12s;
    pointer-events: none;
    z-index: 0;
  }
  
  &:hover::before {
    height: 130%;
    opacity: 0.95;
  }
  
  &:hover::after {
    height: 140%;
    opacity: 0.95;
  }
  
  /* Ensure content is above the gradient */
  > * {
    position: relative;
    z-index: 1;
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.borderActive};
  }
`;

/* Additional gradient layers for dynamic wave effect */
const GradientLayer3 = styled.div`
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 26%;
  height: 0%;
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
  opacity: 0;
  transition: height 1.15s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.75s ease-out;
  transition-delay: 0.08s;
  pointer-events: none;
  z-index: 0;
  
  ${UploadArea}:hover & {
    height: 125%;
    opacity: 0.92;
  }
`;

const GradientLayer4 = styled.div`
  position: absolute;
  bottom: -10px;
  right: 8%;
  width: 30%;
  height: 0%;
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
  opacity: 0;
  transition: height 1.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.82s ease-out;
  transition-delay: 0.18s;
  pointer-events: none;
  z-index: 0;
  
  ${UploadArea}:hover & {
    height: 135%;
    opacity: 0.9;
  }
`;

const UploadIcon = styled(Upload)`
  width: 48px;
  height: 48px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  ${UploadArea}:hover & {
    transform: translateY(-8px) scale(1.08);
    color: ${({ theme }) => theme.colors.textPrimary};
    filter: drop-shadow(0 4px 12px rgba(137, 170, 248, 0.4));
  }
`;

const UploadText = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  ${UploadArea}:hover & {
    transform: translateY(-4px);
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 600;
    text-shadow: 0 2px 8px rgba(183, 112, 252, 0.3);
  }
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  ${UploadArea}:hover & {
    transform: translateY(-2px);
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const ProjectCard = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      135deg,
      rgba(137, 170, 248, 0.4) 0%,
      rgba(183, 112, 252, 0.4) 25%,
      rgba(210, 77, 195, 0.4) 50%,
      rgba(232, 85, 96, 0.4) 75%,
      rgba(245, 161, 147, 0.4) 100%
    );
    border-radius: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(183, 112, 252, 0.02) 0%,
      rgba(210, 77, 195, 0.02) 50%,
      rgba(232, 85, 96, 0.02) 100%
    );
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3),
                0 4px 12px rgba(183, 112, 252, 0.15);
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  /* Ensure content is above gradient layers */
  > * {
    position: relative;
    z-index: 1;
  }
`;

const ProjectThumbnail = styled.div`
  width: 100%;
  height: 140px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  position: relative;
  overflow: hidden;
`;

const ProjectInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const ProjectTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const ProjectActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
`;

const IconButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xs};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 11px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(
      circle,
      rgba(183, 112, 252, 0.15) 0%,
      rgba(210, 77, 195, 0.15) 50%,
      transparent 100%
    );
    transform: translate(-50%, -50%);
    transition: width 0.4s ease, height 0.4s ease;
    border-radius: 50%;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: rgba(183, 112, 252, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(183, 112, 252, 0.2);
  }
  
  &:hover::after {
    width: 120px;
    height: 120px;
  }
  
  &:hover.delete {
    background: ${({ theme }) => theme.colors.error};
    color: white;
    border-color: ${({ theme }) => theme.colors.error};
    box-shadow: 0 3px 12px rgba(244, 67, 54, 0.3);
  }
  
  &:hover.delete::after {
    background: radial-gradient(
      circle,
      rgba(244, 67, 54, 0.2) 0%,
      rgba(244, 67, 54, 0.1) 50%,
      transparent 100%
    );
  }
  
  svg {
    width: 12px;
    height: 12px;
    position: relative;
    z-index: 1;
  }
`;

const Input = styled.input`
  display: none;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  width: 400px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TextInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bgTertiary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  transition: all 0.3s ease;
  
  &:focus {
    border: 1px solid transparent;
    background: linear-gradient(${({ theme }) => theme.colors.bgTertiary}, ${({ theme }) => theme.colors.bgTertiary}) padding-box,
                linear-gradient(90deg, 
                  rgba(137, 170, 248, 0.6) 0%,
                  rgba(183, 112, 252, 0.6) 25%,
                  rgba(210, 77, 195, 0.6) 50%,
                  rgba(232, 85, 96, 0.6) 75%,
                  rgba(245, 161, 147, 0.6) 100%
                ) border-box;
    outline: none;
    box-shadow: 0 0 0 3px rgba(183, 112, 252, 0.1);
  }
  
  &:hover:not(:focus) {
    border-color: rgba(183, 112, 252, 0.4);
    box-shadow: 0 2px 8px rgba(183, 112, 252, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? '#2a2a2a' : theme.colors.bgTertiary};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme, $variant }) => 
    $variant === 'primary' ? 'transparent' : theme.colors.borderColor};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Multi-layer gradient for primary button */
  ${({ $variant }) => $variant === 'primary' && `
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(
        45deg,
        rgba(137, 170, 248, 0.8) 0%,
        rgba(183, 112, 252, 0.8) 25%,
        rgba(210, 77, 195, 0.8) 50%,
        rgba(232, 85, 96, 0.8) 75%,
        rgba(245, 161, 147, 0.8) 100%
      );
      border-radius: 6px;
      z-index: -2;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(183, 112, 252, 0.15) 0%,
        rgba(210, 77, 195, 0.15) 30%,
        rgba(232, 85, 96, 0.15) 70%,
        rgba(245, 161, 147, 0.15) 100%
      );
      border-radius: 6px;
      z-index: -1;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    &:hover::before {
      opacity: 1;
    }
    
    &:hover::after {
      opacity: 0.8;
    }
  `}
  
  &:hover {
    background: ${({ theme, $variant }) => 
      $variant === 'primary' ? '#2a2a2a' : theme.colors.bgHover};
    transform: translateY(-1px);
    ${({ $variant }) => $variant === 'primary' && `
      box-shadow: 0 4px 20px rgba(183, 112, 252, 0.3);
    `}
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

function EditorPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showAlert, showConfirm, showPrompt } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [author, setAuthor] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Update auth modal visibility when authentication status changes
  useEffect(() => {
    setShowAuthModal(!isAuthenticated);
  }, [isAuthenticated]);

  // Set author to current user's username when authenticated
  useEffect(() => {
    if (user) {
      setAuthor(user.username);
    }
  }, [user]);

  // Load projects when user changes (login/logout) or on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    } else {
      setProjects([]); // Clear projects when logged out
    }
  }, [isAuthenticated, user]);

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      await showConfirm({ message: 'Are you sure you want to delete this project?' });
      const userId = user?.id;
      await projectApi.deleteProject(projectId, userId);
      await loadProjects();
      await showAlert({ message: 'Project deleted successfully', type: 'success' });
    } catch (error) {
      // User cancelled or error occurred
      if (error && typeof error === 'object' && 'message' in error) {
        await showAlert({ message: 'Failed to delete project', type: 'error' });
      }
    }
  };

  const handleDuplicateProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      const name = await showPrompt({ message: 'Enter a name for the duplicated project:' });
      if (!name) return;
      
      const userId = user?.id;
      await projectApi.duplicateProject(projectId, name, userId);
      await loadProjects();
      await showAlert({ message: 'Project duplicated successfully', type: 'success' });
    } catch (error) {
      await showAlert({ message: 'Failed to duplicate project', type: 'error' });
    }
  };

  const handleRenameProject = async (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleSaveRename = async (projectId: string) => {
    if (!editingName.trim()) return;
    
    try {
      await projectApi.renameProject(projectId, editingName);
      setEditingProjectId(null);
      setEditingName('');
      await loadProjects();
    } catch (error) {
      await showAlert({ message: 'Failed to rename project', type: 'error' });
    }
  };

  const handleCancelRename = () => {
    setEditingProjectId(null);
    setEditingName('');
  };

  const loadProjects = async () => {
    try {
      // Use user ID to fetch projects
      const userId = user?.id;
      const data = await projectApi.getProjects(userId);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.als')) {
      setSelectedFile(files[0]);
      // Auto-fill author with logged-in username
      if (user) {
        setAuthor(user.username);
      }
      setShowModal(true);
    } else {
      await showAlert({ message: 'Please upload a valid .als file', type: 'warning' });
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].name.endsWith('.als')) {
        setSelectedFile(files[0]);
        // Auto-fill author with logged-in username
        if (user) {
          setAuthor(user.username);
        }
        setShowModal(true);
      } else {
        await showAlert({ message: 'Please upload a valid .als file', type: 'warning' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !projectName || !author) return;
    
    // Check authentication first
    if (!isAuthenticated || !user) {
      await showAlert({ 
        message: 'Please log in to create a project.', 
        type: 'error' 
      });
      setShowModal(false);
      setShowAuthModal(true);
      return;
    }
    
    setIsUploading(true);
    try {
      // Use user ID for authentication
      const userId = user.id;
      console.log('Initializing project with:', { projectName, author, fileName: selectedFile.name, userId });
      
      const result = await projectApi.initProject(
        selectedFile, 
        projectName, 
        author, 
        userId // Pass user ID
      );
      console.log('Project initialized successfully:', result);
      
      // Close modal and clear state first
      setShowModal(false);
      setSelectedFile(null);
      setProjectName('');
      
      // Reload projects in background
      loadProjects().catch(console.error);
      
      // Navigate immediately without waiting for alert
      navigate(`/project/${result.projectId}`);
      
    } catch (error: any) {
      console.error('Error initializing project:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error occurred';
      await showAlert({ message: `Failed to initialize project: ${errorMsg}\n\nPlease check that the backend server is running on port 3001.`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFile(null);
    setProjectName('');
    setAuthor('');
  };

  return (
    <Container>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarContent>
          {user && (
            <>
              <UserSection>
                <UserProfile>
                  <UserAvatar>
                    {user.username.charAt(0).toUpperCase()}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{user.username}</UserName>
                    <UserEmail>{user.email || 'user@coldaw.com'}</UserEmail>
                  </UserDetails>
                </UserProfile>
                
                <AccountButton onClick={() => navigate('/account')}>
                  <User size={16} />
                  Account
                </AccountButton>
              </UserSection>
              
              <SidebarNav>
                <NavItem $active>
                  <Folder size={16} />
                  Projects
                </NavItem>
                <NavItem>
                  <Settings size={16} />
                  Settings
                </NavItem>
              </SidebarNav>
            </>
          )}
        </SidebarContent>
        
        <SidebarFooter>
          <Logo>
            ColDAW
            <VersionBadge>beta</VersionBadge>
          </Logo>
        </SidebarFooter>
      </Sidebar>
      
      {/* Main Content */}
      <MainContent>
        <Content>
          {/* Upload Area */}
          <UploadArea
            $isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <GradientLayer3 />
            <GradientLayer4 />
            <UploadIcon />
            <UploadText>Create New Project</UploadText>
            <UploadHint>Drop your .als file here or click to browse</UploadHint>
          </UploadArea>
          
          {/* Projects Grid */}
          {projects.length > 0 && (
            <ProjectsGrid>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <ProjectThumbnail>
                    <ProjectThumbnailCanvas 
                      projectId={project.id} 
                      projectName={project.name}
                    />
                  </ProjectThumbnail>
                  
                  <ProjectInfo>
                    {editingProjectId === project.id ? (
                      <TextInput
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveRename(project.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(project.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <>
                        <ProjectTitle>{project.name}</ProjectTitle>
                        <ProjectMeta>
                          <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                        </ProjectMeta>
                      </>
                    )}
                  </ProjectInfo>
                  
                  <ProjectActions onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      onClick={(e) => handleRenameProject(e, project)}
                      title="Rename"
                    >
                      <Edit2 size={14} />
                    </IconButton>
                    <IconButton
                      onClick={(e) => handleDuplicateProject(e, project.id)}
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </IconButton>
                    <IconButton
                      className="delete"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </ProjectActions>
                </ProjectCard>
              ))}
            </ProjectsGrid>
          )}
        </Content>
      </MainContent>

      <Input
        ref={fileInputRef}
        type="file"
        accept=".als"
        onChange={handleFileChange}
      />

      {showModal && (
        <Modal onClick={handleCancel}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Initialize Project</ModalTitle>
            
            <Label>Project Name</Label>
            <TextInput
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Track"
            />
            
            <Label>Your Name</Label>
            <TextInput
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Artist Name"
            />
            
            <Label>File</Label>
            <TextInput
              type="text"
              value={selectedFile?.name || ''}
              disabled
            />
            
            <ButtonGroup>
              <Button $variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                $variant="primary"
                onClick={handleSubmit}
                disabled={!projectName || !author || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Create Project'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default EditorPage;
