import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

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
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border: 1px solid transparent;
    background: linear-gradient(${({ theme }) => theme.colors.bgPrimary}, ${({ theme }) => theme.colors.bgPrimary}) padding-box,
                linear-gradient(90deg, 
                  rgba(137, 170, 248, 0.6) 0%,
                  rgba(183, 112, 252, 0.6) 25%,
                  rgba(210, 77, 195, 0.6) 50%,
                  rgba(232, 85, 96, 0.6) 75%,
                  rgba(245, 161, 147, 0.6) 100%
                ) border-box;
    box-shadow: 0 0 0 3px rgba(183, 112, 252, 0.1);
  }
  
  &:hover:not(:focus) {
    border-color: rgba(183, 112, 252, 0.4);
    box-shadow: 0 2px 8px rgba(183, 112, 252, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  font-weight: 600;
  background: #2a2a2a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(183, 112, 252, 0.3);
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:hover::after {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 13px;
  text-align: center;
  margin-top: -${({ theme }) => theme.spacing.sm};
`;

const ToggleText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: ${({ theme }) => theme.spacing.md};
  
  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    text-decoration: underline;
    font-size: inherit;
    padding: 0;
    margin-left: 4px;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

interface AuthModalProps {
  onClose?: () => void;
}

function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const { login, sendVerificationCode, register } = useAuth();

  // Countdown effect
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login uses email
        await login(email, password);
        if (onClose) {
          onClose();
        }
      } else {
        if (!isVerificationStep) {
          // Step 1: Send verification code
          if (!email || !name || !password) {
            throw new Error('Please enter all required fields');
          }
          await sendVerificationCode(email);
          setIsVerificationStep(true);
          setResendCountdown(60); // 60 second countdown

        } else {
          // Step 2: Verify code and register
          if (!verificationCode) {
            throw new Error('Please enter verification code');
          }
          await register(email, password, name, verificationCode);
          if (onClose) {
            onClose();
          }
        }
      }
    } catch (err: any) {
      let errorMessage = 'Operation failed, please try again';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 409:
            errorMessage = 'This email is already registered. Please try logging in instead.';
            break;
          case 429:
            errorMessage = data.error || 'Too many requests. Please wait a moment before trying again.';
            break;
          case 400:
            errorMessage = data.error || 'Invalid input. Please check your information.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data.error || `Error ${status}: ${err.message}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      await sendVerificationCode(email);
      setResendCountdown(60);
    } catch (err: any) {
      let errorMessage = 'Failed to send verification code';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 429:
            errorMessage = data.error || 'Too many requests. Please wait before trying again.';
            break;
          case 409:
            errorMessage = 'This email is already registered.';
            break;
          default:
            errorMessage = data.error || errorMessage;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setIsVerificationStep(false);
    setResendCountdown(0);
    setVerificationCode('');
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>
          {isLogin ? 'Login' : (isVerificationStep ? 'Verify Email' : 'Sign Up')}
        </Title>
        <Form onSubmit={handleSubmit}>
          {!isVerificationStep && (
            <>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                />
              )}
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </>
          )}
          {isVerificationStep && (
            <>
              <p style={{ color: '#b0b0b0', fontSize: '14px', textAlign: 'center', margin: '0 0 16px 0' }}>
                We've sent a verification code to {email}
              </p>
              <Input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                autoFocus
                maxLength={6}
              />
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0 || isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCountdown > 0 ? '#707070' : '#EB5A72',
                    cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}
                >
                  {resendCountdown > 0 
                    ? `Resend code in ${resendCountdown}s` 
                    : 'Resend verification code'}
                </button>
              </div>
            </>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 
             isLogin ? 'Login' : 
             isVerificationStep ? 'Verify & Sign Up' : 'Send Verification Code'}
          </Button>
          {onClose && (
            <SecondaryButton type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
          )}
        </Form>
        {!isVerificationStep && (
          <ToggleText>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={toggleMode}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </ToggleText>
        )}
      </Modal>
    </Overlay>
  );
}

export default AuthModal;
