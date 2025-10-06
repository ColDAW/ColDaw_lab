import { useState } from 'react';
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
  border-radius: 8px;
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
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // 登录使用 email
        await login(email, password);
      } else {
        // 注册需要 email, password, name
        if (!email || !name) {
          throw new Error('Please enter all required fields');
        }
        await register(email, password, name);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>{isLogin ? 'Login' : 'Sign Up'}</Title>
        <Form onSubmit={handleSubmit}>
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
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
          {onClose && (
            <SecondaryButton type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
          )}
        </Form>
        <ToggleText>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" onClick={toggleMode}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </ToggleText>
      </Modal>
    </Overlay>
  );
}

export default AuthModal;
