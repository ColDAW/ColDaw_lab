export const theme = {
  colors: {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#141414',
    bgTertiary: '#1e1e1e',
    bgHover: '#2a2a2a',
    
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#707070',
    
    primary: '#EB5A72',
    primarySolid: '#EB5A72', // Solid color version for borders etc
    accentOrange: '#EB5A72',
    accentRed: '#EB5A72',
    accentGreen: '#EB5A72',
    accentBlue: '#EB5A72',
    accentYellow: '#EB5A72',
    
    borderColor: '#2a2a2a',
    borderActive: '#404040',
    
    error: '#EB5A72',
    success: '#4CAF50',
    warning: '#FF9800',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  sizes: {
    headerHeight: '48px',
    sidebarWidth: '240px',
    trackHeight: '48px',
  },
  
  fonts: {
    mono: "'Poppins', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
    sans: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
    logo: "'Poppins', 'Righteous', 'Impact', 'Haettenschweiler', 'Arial Black', sans-serif",
  },
};

export type Theme = typeof theme;
