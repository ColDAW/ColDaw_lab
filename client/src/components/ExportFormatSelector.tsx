import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown, FileText, ArrowUp, Box, Disc3 } from 'lucide-react';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: React.ReactNode;
  description: string;
}

interface ExportFormatSelectorProps {
  onFormatSelect: (format: ExportFormat) => void;
  disabled?: boolean;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'ableton',
    name: 'Ableton Live',
    extension: '.als',
    icon: <ArrowUp size={16} />,
    description: 'Ableton Live Set format'
  },
  {
    id: 'touchdesigner',
    name: 'TouchDesigner',
    extension: '.toe',
    icon: <Box size={16} />,
    description: 'TouchDesigner Project with DAT→CHOP setup'
  },
  {
    id: 'json',
    name: 'Raw JSON',
    extension: '.json',
    icon: <FileText size={16} />,
    description: 'Raw project data in JSON format'
  },
  {
    id: 'logic',
    name: 'Logic Pro',
    extension: '.logicx',
    icon: <Disc3 size={16} />,
    description: 'Logic Pro X Project format'
  }
];

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const DownloadButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bgTertiary};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.sans};

  &:hover {
    background: ${({ theme }) => theme.colors.bgSecondary};
    border-color: ${({ theme }) => theme.colors.accentOrange};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg:last-child {
    transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transform: translateY(${({ isOpen }) => isOpen ? '4px' : '0px'});
  transition: all 0.2s ease;
  min-width: 250px;
`;

const FormatOption = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};

  &:last-child {
    border-bottom: none;
    border-radius: 0 0 4px 4px;
  }

  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
  }
`;

const FormatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FormatName = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

const FormatDescription = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FormatExtension = styled.span`
  margin-left: auto;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.accentOrange};
  font-family: ${({ theme }) => theme.fonts.mono};
`;

export default function ExportFormatSelector({ onFormatSelect, disabled = false }: ExportFormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setIsOpen(false);
    onFormatSelect(format);
  };

  return (
    <Container ref={containerRef}>
      <DownloadButton
        isOpen={isOpen}
        onClick={handleButtonClick}
        disabled={disabled}
      >
        <ArrowUp size={16} />
        Export
        <ChevronDown size={14} />
      </DownloadButton>

      <DropdownMenu isOpen={isOpen}>
        {exportFormats.map((format) => (
          <FormatOption
            key={format.id}
            onClick={() => handleFormatSelect(format)}
          >
            {format.icon}
            <FormatInfo>
              <FormatName>{format.name}</FormatName>
              <FormatDescription>{format.description}</FormatDescription>
            </FormatInfo>
            <FormatExtension>{format.extension}</FormatExtension>
          </FormatOption>
        ))}
      </DropdownMenu>
    </Container>
  );
}

export type { ExportFormat };