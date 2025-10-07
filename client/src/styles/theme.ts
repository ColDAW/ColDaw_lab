export const theme = {
  colors: {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#141414',
    bgTertiary: '#1e1e1e',
    bgHover: '#2a2a2a',
    
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#707070',
    
    primary: '#0088ff',
    accentOrange: '#ff5500',
    accentRed: '#ff0055',
    accentGreen: '#00ff88',
    accentBlue: '#0088ff',
    accentYellow: '#ffcc00',
    
    borderColor: '#2a2a2a',
    borderActive: '#404040',
    
    error: '#ff0055',
    success: '#00ff88',
    warning: '#ffcc00',
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
    mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
    sans: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
    logo: '"Righteous", "Impact", "Haettenschweiler", "Arial Black", sans-serif',
  },
};

export type Theme = typeof theme;
