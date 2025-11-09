# Landing Page Documentation

## Tech Stack

- React + TypeScript + Styled-components
- Smooth scroll animations (Intersection Observer)
- Responsive design (mobile-first)

## Structure

```
LandingPage.tsx
├── Header (fixed navigation)
├── Hero Section (headline + CTA)
├── Composition Section (interactive cards)
├── Features Section (feature grid)
└── Footer (links + info)
```

## Key Features

### Gradient Button Animation

Apple Intelligence-style hover effect:

```typescript
const PrimaryButton = styled.button`
  background: #ffffff;
  
  /* Multi-layer gradient on hover */
  &::before {
    background-image: linear-gradient(
      0deg,
      rgba(137, 170, 248, 1) 0%,
      rgba(183, 112, 252, 1) 35%,
      rgba(210, 77, 195, 0) 100%
    );
    filter: blur(40px);
    transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  &:hover::before {
    height: 70%;
    opacity: 1;
  }
`;
```

### Scroll Animations

```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    },
    { threshold: 0.1 }
  );
  
  observer.observe(sectionRef.current);
}, []);

// Animated component
const AnimatedSection = styled.div<{ visible: boolean }>`
  opacity: ${p => p.visible ? 1 : 0};
  transform: ${p => p.visible ? 'translateY(0)' : 'translateY(30px)'};
  transition: all 0.6s ease-out;
`;
```

## Color Palette

```typescript
const colors = {
  background: '#0a0a0a',
  surface: '#141414',
  text: '#d3d3d3',
  textMuted: '#838383',
  accent: '#ffffff',
  border: 'rgba(255, 255, 255, 0.1)',
};
```

## Typography

```typescript
font-family: 'Poppins', sans-serif;

// Responsive sizes
h1: clamp(1.5rem, 4vw, 2.5rem)
h2: 2rem
p: 1rem

letter-spacing: -0.03em  // Tight for headlines
```

## Responsive Design

```typescript
@media (max-width: 768px) {
  // Hide nav links, show menu
  // Stack buttons vertically
  // Single column cards
  // Reduce padding
}
```

## Performance

- **Lazy load images**: `loading="lazy"`
- **Video optimization**: `preload="metadata"`
- **GPU acceleration**: Use `transform` and `opacity`
- **Intersection Observer**: Animate only visible elements

## Components

### Header
```typescript
const Header = styled.header`
  position: fixed;
  backdrop-filter: blur(20px);
  background: rgba(10, 10, 10, 0.8);
`;
```

### Feature Card
```typescript
const FeatureCard = styled.div`
  background: linear-gradient(135deg, 
    rgba(30, 30, 30, 0.6), 
    rgba(20, 20, 20, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  &:hover {
    transform: translateY(-4px);
  }
`;
```

## Navigation

```typescript
const navigate = useNavigate();

<PrimaryButton onClick={() => navigate('/register')}>
  Get Started
</PrimaryButton>

<SecondaryButton onClick={() => navigate('/login')}>
  Sign In
</SecondaryButton>
```

## Customization

**Change colors**: Edit `colors` object
**Add section**: Create new styled component + add to JSX
**Modify animations**: Adjust transition timing/easing
