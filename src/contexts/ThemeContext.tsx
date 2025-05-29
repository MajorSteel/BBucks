import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

// Define theme types and colors
export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  subtext: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  cardAlt: string;
  gradient: string[];
}

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

// Define theme color palettes
export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F7FA',
  primary: '#0070F3',
  secondary: '#7928CA',
  accent: '#00E5FF',
  text: '#1A1A2E',
  subtext: '#4A5568',
  border: '#E2E8F0',
  error: '#FF4757',
  success: '#28C76F',
  warning: '#FF9F43',
  card: '#FFFFFF',
  cardAlt: '#F0F4F8',
  gradient: ['#0070F3', '#7928CA'],
};

export const darkColors: ThemeColors = {
  background: '#0A0C10',
  surface: '#121826',
  primary: '#0070F3',
  secondary: '#7928CA',
  accent: '#00E5FF',
  text: '#FFFFFF',
  subtext: '#A0AEC0',
  border: '#2D3748',
  error: '#FF4757',
  success: '#28C76F',
  warning: '#FF9F43',
  card: '#1A202C',
  cardAlt: '#252D3D',
  gradient: ['#0070F3', '#7928CA'],
};

// Create context with default value
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  colors: darkColors,
  setTheme: () => {},
  isDark: true,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('system');
  
  // Determine if dark mode is active based on theme setting or system preference
  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark' 
    : theme === 'dark';
  
  // Select color palette based on dark mode state
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => useContext(ThemeContext);