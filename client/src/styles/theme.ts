export const theme = {
  colors: {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#141414',
    bgTertiary: '#1e1e1e',
    bgHover: '#2a2a2a',
    
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#707070',
    
    primary: 'linear-gradient(123deg, #FF9B58 -83.38%, #E0387E 113%)',
    primarySolid: '#E0387E', // 纯色版本用于边框等
    accentOrange: 'linear-gradient(123deg, #FF9B58 -83.38%, #E0387E 113%)',
    accentRed: 'linear-gradient(123deg, #FF9B58 -83.38%, #E0387E 113%)',
    accentGreen: 'linear-gradient(123deg, #FF9B58 -83.38%, #E0387E 113%)',
    accentBlue: 'linear-gradient(123deg, #FF9B58 -83.38%, #E0387E 113%)',
    accentYellow: 'linear-gradient(123deg, #FF9B58 -83.38%, #E0387E 113%)',
    
    borderColor: '#2a2a2a',
    borderActive: '#404040',
    
    error: '#E0387E',
    success: '#FF9B58',
    warning: '#E0387E',
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
