import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { waitlistApi } from '../api/api';
import closeIcon from '../img/close.svg';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
`;

const FormContainer = styled.div`
  max-width: 500px;
  width: 100%;
  padding: 2rem 0;
  position: relative;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.3s ease, transform 0.2s ease;
  z-index: 100;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(211, 211, 211, 1);
  margin-bottom: 1rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  color: rgba(211, 211, 211, 1);
  margin-bottom: 0.5rem;
  text-align: center;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #838383;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 500;
`;

const Input = styled.input`
  background: rgba(40, 40, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  color: white;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(211, 211, 211, 0.5);
    background: rgba(50, 50, 50, 0.8);
  }

  &::placeholder {
    color: #666;
  }
`;

const Select = styled.select`
  background: rgba(40, 40, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  color: white;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(211, 211, 211, 0.5);
    background: rgba(50, 50, 50, 0.8);
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const SubmitButton = styled.button`
  background: rgba(211, 211, 211, 1);
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  color: #0a0a0a;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #555;
    color: #999;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: #ef4444;
  padding: 0.875rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
`;

const WaitlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.role) {
      setError('Please select what best describes you');
      return;
    }

    setIsSubmitting(true);

    try {
      await waitlistApi.joinWaitlist(formData);
      
      // Navigate to thank you page with user data
      navigate('/waitlist/thank-you', { 
        state: { 
          name: formData.name,
          email: formData.email 
        } 
      });
    } catch (err: any) {
      console.error('Waitlist submission error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to join waitlist. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <CloseButton onClick={() => navigate('/')} aria-label="Close">
          <img src={closeIcon} alt="Close" />
        </CloseButton>
        <Logo>ColDaw</Logo>
        <Title>Join Beta</Title>
        <Subtitle>
          Be among the first to experience the future of collaborative music production
        </Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="role">What best describes you? *</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select one...</option>
              <option value="music-producer">Music Producer</option>
              <option value="sound-engineer">Sound Engineer</option>
              <option value="musician">Musician / Artist</option>
              <option value="dj">DJ</option>
              <option value="content-creator">Content Creator</option>
              <option value="educator">Music Educator</option>
              <option value="student">Student</option>
              <option value="hobbyist">Hobbyist</option>
              <option value="studio-owner">Studio Owner</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Joining...' : 'Join Beta'}
          </SubmitButton>
        </Form>
      </FormContainer>
    </PageContainer>
  );
};

export default WaitlistPage;
