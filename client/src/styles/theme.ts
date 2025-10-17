export const theme = {
  colors: {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#141414',
    bgTertiary: '#1e1e1e',
    bgHover: '#2a2a2a',
    
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#707070',
    
    primary: '#ff69b4',
    accentOrange: '#ff69b4',
    accentRed: '#ff1493',
    accentGreen: '#ff69b4',
    accentBlue: '#ff69b4',
    accentYellow: '#ff69b4',
    
    borderColor: '#2a2a2a',
    borderActive: '#404040',
    
    error: '#ff1493',
    success: '#ff69b4',
    warning: '#ff69b4',
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
