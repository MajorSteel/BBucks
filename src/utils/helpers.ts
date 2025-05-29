import { Platform } from 'react-native';

// Generate a 3D shadow style based on elevation
export const generateShadow = (
  elevation = 5, 
  color = '#000', 
  opacity = 0.2,
  offsetX = 0,
  offsetY = 2,
) => {
  return {
    shadowColor: color,
    shadowOffset: {
      width: offsetX,
      height: offsetY,
    },
    shadowOpacity: opacity,
    shadowRadius: elevation / 2,
    elevation: Platform.OS === 'android' ? elevation : 0,
  };
};

// Format currency with symbol and proper decimal places
export const formatCurrency = (
  amount: number,
  currency: string,
  symbol?: string,
  decimalPlaces = 2
): string => {
  // Currency symbols for common currencies
  const symbols: { [key: string]: string } = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    AED: 'د.إ',
  };
  
  // Use provided symbol or lookup from our map, default to currency code if not found
  const currencySymbol = symbol || symbols[currency] || currency;
  
  // Format the number with the specified decimal places
  const formattedAmount = amount.toFixed(decimalPlaces);
  
  // Return formatted string: symbol followed by the amount
  return `${currencySymbol}${formattedAmount}`;
};

// Format large numbers with K, M, B suffixes
export const formatCompactNumber = (number: number): string => {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return `${(number / 1000).toFixed(1)}K`;
  } else if (number < 1000000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  } else {
    return `${(number / 1000000000).toFixed(1)}B`;
  }
};

// Format timestamp to readable date/time
export const formatTimestamp = (
  timestamp: number, 
  format: 'date' | 'time' | 'datetime' = 'datetime'
): string => {
  const date = new Date(timestamp);
  
  if (format === 'date') {
    return date.toLocaleDateString();
  } else if (format === 'time') {
    return date.toLocaleTimeString();
  } else {
    return date.toLocaleString();
  }
};

// Calculate percentage change between two values
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

// Generate gradient colors from a base color
export const generateGradientFromColor = (
  baseColor: string, 
  variant: 'light' | 'dark' | 'intense' = 'light'
): string[] => {
  // Convert hex to RGB for manipulation
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : [0, 0, 0];
  };
  
  // RGB to hex conversion
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  
  // Get RGB from base color
  const [r, g, b] = hexToRgb(baseColor);
  
  // Create gradient based on variant
  switch (variant) {
    case 'light': {
      // Lighten for second color
      const secondColor = rgbToHex(
        Math.min(255, r + 40),
        Math.min(255, g + 40),
        Math.min(255, b + 40)
      );
      return [baseColor, secondColor];
    }
    
    case 'dark': {
      // Darken for second color
      const secondColor = rgbToHex(
        Math.max(0, r - 40),
        Math.max(0, g - 40),
        Math.max(0, b - 40)
      );
      return [baseColor, secondColor];
    }
    
    case 'intense': {
      // Create more intense gradient (lighten and darken)
      const lighterColor = rgbToHex(
        Math.min(255, r + 60),
        Math.min(255, g + 60),
        Math.min(255, b + 60)
      );
      const darkerColor = rgbToHex(
        Math.max(0, r - 40),
        Math.max(0, g - 40),
        Math.max(0, b - 40)
      );
      return [lighterColor, baseColor, darkerColor];
    }
    
    default:
      return [baseColor, baseColor];
  }
};

// Calculate readable text color based on background color (black or white)
export const getReadableTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : [0, 0, 0];
  };
  
  // Calculate luminance using relative luminance formula
  const calculateLuminance = (r: number, g: number, b: number): number => {
    // Normalized RGB values
    const normR = r / 255;
    const normG = g / 255;
    const normB = b / 255;
    
    // Calculated using relative luminance formula
    const lum = 0.2126 * normR + 0.7152 * normG + 0.0722 * normB;
    
    return lum;
  };
  
  const [r, g, b] = hexToRgb(backgroundColor);
  const luminance = calculateLuminance(r, g, b);
  
  // Use white text on dark backgrounds, black on light
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Validate a currency amount input (allowing numbers and decimal point)
export const validateCurrencyInput = (text: string): boolean => {
  // Regex for currency format: digits with optional decimal point and up to 2 decimal places
  const currencyRegex = /^(\d+)?(\.\d{0,2})?$/;
  return currencyRegex.test(text);
};