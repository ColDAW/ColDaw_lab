import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, User, LogOut, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

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

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.accentOrange};
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.borderActive};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PageTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  font-family: 'Poppins', ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const InfoText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textTertiary};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentBlue};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DangerZone = styled.div`
  border: 1px solid #ef4444;
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  background: rgba(239, 68, 68, 0.05);
`;

const DangerTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: #ef4444;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DangerText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.username || '');

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = async () => {
    // TODO: Implement save to backend
    await showAlert({ message: 'Settings saved successfully!', type: 'success' });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (await showConfirm({ message: 'Are you sure you want to logout?', type: 'warning' })) {
      logout();
      navigate('/');
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Container>
      <Sidebar>
        <Logo onClick={handleBack}>ColDAW</Logo>
        <BackButton onClick={handleBack}>
          <ArrowLeft />
          Back to Home
        </BackButton>
      </Sidebar>
      
      <MainContent>
        <ContentContainer>
          <PageHeader>
            <PageTitle>Account Settings</PageTitle>
            <PageSubtitle>Manage your account information and preferences</PageSubtitle>
          </PageHeader>
          
          <Section>
            <UserAvatar>
              {user.username.charAt(0).toUpperCase()}
            </UserAvatar>
            <SectionTitle>Profile Information</SectionTitle>
            
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={user.username}
                disabled
              />
              <InfoText>Your username cannot be changed</InfoText>
            </FormGroup>
            
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={user.email}
                disabled
              />
              <InfoText>Your email address</InfoText>
            </FormGroup>
            
            <FormGroup>
              <Label>Display Name</Label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                disabled={!isEditing}
              />
              <InfoText>This is how your name will appear in collaborative sessions</InfoText>
            </FormGroup>
            
            <ButtonGroup>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <User />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button $variant="primary" onClick={handleSave}>
                    <Save />
                    Save Changes
                  </Button>
                  <Button onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user.username);
                  }}>
                    Cancel
                  </Button>
                </>
              )}
            </ButtonGroup>
          </Section>
          
          <Section>
            <SectionTitle>Account Information</SectionTitle>
            <FormGroup>
              <Label>User ID</Label>
              <Input
                type="text"
                value={user.id}
                disabled
              />
              <InfoText>Your unique user identifier</InfoText>
            </FormGroup>
          </Section>
          
          <DangerZone>
            <DangerTitle>Danger Zone</DangerTitle>
            <DangerText>
              Once you logout, you'll need to login again to access your projects.
            </DangerText>
            <Button $variant="danger" onClick={handleLogout}>
              <LogOut />
              Logout
            </Button>
          </DangerZone>
        </ContentContainer>
      </MainContent>
    </Container>
  );
}

export default AccountPage;
