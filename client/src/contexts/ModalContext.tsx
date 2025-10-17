import { createContext, useContext, useState, ReactNode } from 'react';
import styled from 'styled-components';
import { AlertCircle, HelpCircle, MessageSquare, X } from 'lucide-react';

type ModalType = 'alert' | 'confirm' | 'prompt';

interface ModalOptions {
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  defaultValue?: string;
  placeholder?: string;
}

interface ModalContextType {
  showAlert: (options: string | ModalOptions) => Promise<void>;
  showConfirm: (options: string | ModalOptions) => Promise<boolean>;
  showPrompt: (options: string | ModalOptions) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  min-width: 400px;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: slideIn 0.2s ease;
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div<{ $type?: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  
  svg {
    width: 24px;
    height: 24px;
    color: ${({ $type, theme }) => {
      switch ($type) {
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        case 'success': return '#22c55e';
        default: return theme.colors.accentBlue;
      }
    }};
  }
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textPrimary};
  flex: 1;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textTertiary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const Message = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const Input = styled.input`
  width: 100%;
  margin-top: 16px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentBlue};
    box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid;
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.accentBlue};
          color: white;
          border-color: ${theme.colors.accentBlue};
          
          &:hover {
            background: ${theme.colors.accentBlue}dd;
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: transparent;
          color: ${theme.colors.textSecondary};
          border-color: ${theme.colors.borderColor};
          
          &:hover {
            background: ${theme.colors.bgTertiary};
            color: ${theme.colors.textPrimary};
            border-color: ${theme.colors.borderActive};
          }
        `;
    }
  }}
`;

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  messageType: 'info' | 'warning' | 'error' | 'success';
  inputValue: string;
  placeholder: string;
  resolve: ((value: any) => void) | null;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    messageType: 'info',
    inputValue: '',
    placeholder: '',
    resolve: null,
  });

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (options: string | ModalOptions): Promise<void> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options;
      setModal({
        isOpen: true,
        type: 'alert',
        title: opts.title || 'Notice',
        message: opts.message,
        messageType: opts.type || 'info',
        inputValue: '',
        placeholder: '',
        resolve: () => {
          resolve();
          closeModal();
        },
      });
    });
  };

  const showConfirm = (options: string | ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options;
      setModal({
        isOpen: true,
        type: 'confirm',
        title: opts.title || 'Confirm',
        message: opts.message,
        messageType: opts.type || 'warning',
        inputValue: '',
        placeholder: '',
        resolve: (value: boolean) => {
          resolve(value);
          closeModal();
        },
      });
    });
  };

  const showPrompt = (options: string | ModalOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options;
      setModal({
        isOpen: true,
        type: 'prompt',
        title: opts.title || 'Input',
        message: opts.message,
        messageType: opts.type || 'info',
        inputValue: opts.defaultValue || '',
        placeholder: opts.placeholder || '',
        resolve: (value: string | null) => {
          resolve(value);
          closeModal();
        },
      });
    });
  };

  const handleConfirm = () => {
    if (modal.type === 'prompt') {
      modal.resolve?.(modal.inputValue);
    } else if (modal.type === 'confirm') {
      modal.resolve?.(true);
    } else {
      modal.resolve?.(undefined);
    }
  };

  const handleCancel = () => {
    if (modal.type === 'prompt') {
      modal.resolve?.(null);
    } else if (modal.type === 'confirm') {
      modal.resolve?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (modal.type !== 'alert') {
        handleCancel();
      }
    }
  };

  const getIcon = () => {
    if (modal.type === 'confirm') {
      return <HelpCircle />;
    } else if (modal.type === 'prompt') {
      return <MessageSquare />;
    } else {
      return <AlertCircle />;
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {modal.isOpen && (
        <Overlay onClick={(e) => e.target === e.currentTarget && modal.type !== 'alert' && handleCancel()}>
          <ModalContainer onKeyDown={handleKeyDown}>
            <ModalHeader $type={modal.messageType}>
              {getIcon()}
              <ModalTitle>{modal.title}</ModalTitle>
              {modal.type !== 'alert' && (
                <CloseButton onClick={handleCancel}>
                  <X />
                </CloseButton>
              )}
            </ModalHeader>
            
            <ModalBody>
              <Message>{modal.message}</Message>
              {modal.type === 'prompt' && (
                <Input
                  type="text"
                  value={modal.inputValue}
                  onChange={(e) => setModal(prev => ({ ...prev, inputValue: e.target.value }))}
                  placeholder={modal.placeholder}
                  autoFocus
                />
              )}
            </ModalBody>
            
            <ModalFooter>
              {modal.type === 'alert' && (
                <Button $variant="primary" onClick={handleConfirm}>
                  OK
                </Button>
              )}
              {modal.type === 'confirm' && (
                <>
                  <Button $variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button $variant="danger" onClick={handleConfirm}>
                    Confirm
                  </Button>
                </>
              )}
              {modal.type === 'prompt' && (
                <>
                  <Button $variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button $variant="primary" onClick={handleConfirm}>
                    OK
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContainer>
        </Overlay>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
