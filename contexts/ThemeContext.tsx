import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance, ViewStyle, TextStyle } from 'react-native';

// Type definitions
interface Colors {
  borders: any;
  backgrounds: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    inverse: string;
    link: string;
    destructive: string;
    success: string;
    warning: string;
  };
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  cards: {
    background: string;
    border: string;
    shadow: string;
    overlay: string;
  };
  navigation: {
    background: string;
    border: string;
    active: string;
    inactive: string;
  };
  status: {
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  semantic: {
    error: string | undefined;
    separator: string;
    fill: string;
    disabled: string;
  };
}

interface Typography {
  body: any;
  fonts: {
    system: string;
    serif: string;
    display: string;
  };
  sizes: {
    caption: number;
    footnote: number;
    subheadline: number;
    callout: number;
    body: number;
    headline: number;
    title3: number;
    title2: number;
    title1: number;
    largeTitle: number;
    display: number;
  };
  weights: {
    ultraLight: '100';
    thin: '200';
    light: '300';
    regular: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
    heavy: '800';
    black: '900';
  };
  lineHeights: {
    caption: number;
    footnote: number;
    subheadline: number;
    callout: number;
    body: number;
    headline: number;
    title3: number;
    title2: number;
    title1: number;
    largeTitle: number;
    display: number;
  };
}

interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
  '7xl': number;
  '8xl': number;
}

interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

interface Shadows {
  card: ShadowStyle;
  elevated: ShadowStyle;
  modal: ShadowStyle;
}

interface Theme {
  isDarkMode: boolean;
  themeType: 'light' | 'dark';
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  getTextColor: (variant?: keyof Colors['text']) => string;
  getBackgroundColor: (variant?: keyof Colors['backgrounds']) => string;
  getBrandColor: (variant?: keyof Colors['brand']) => string;
  cardStyle: {
    backgroundColor: string;
    borderColor: string;
  } & ShadowStyle;
  navigationStyle: {
    backgroundColor: string;
    borderColor: string;
  };
}

// Apple News Theme Configuration
const appleNewsThemes = {
  light: {
    // Borders
    borders: {
      light: '#E5E5EA',
      dark: '#000000',
    },

    // Background Colors
    backgrounds: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
      tertiary: '#FFFFFF',
      elevated: '#FFFFFF',
      overlay: 'rgba(0,0,0,0.4)',
    },

    // Text Colors
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#3C3C4399',
      quaternary: '#3C3C434D',
      inverse: '#FFFFFF',
      link: '#007AFF',
      destructive: '#FF3B30',
      success: '#30D158',
      warning: '#FF9500',
    },

    // Brand Colors
    brand: {
      primary: '#FF6B6B',
      secondary: '#4ADE80',
      accent: '#007AFF',
    },

    // Card Colors
    cards: {
      background: '#FFFFFF',
      border: '#E5E5EA',
      shadow: 'rgba(0,0,0,0.1)',
      overlay: 'rgba(0,0,0,0.3)',
    },

    // Navigation Colors
    navigation: {
      background: '#F2F2F7',
      border: '#E5E5EA',
      active: '#007AFF',
      inactive: '#8E8E93',
    },

    // Status Colors
    status: {
      error: '#FF3B30',
      warning: '#FF9500',
      success: '#30D158',
      info: '#007AFF',
    },

    // Semantic Colors
    semantic: {
      separator: '#E5E5EA',
      fill: '#E5E5EA',
      disabled: '#8E8E93',
    },
  } as Colors,

  dark: {
    // Borders
    borders: {
      light: '#38383A',
      dark: '#FFFFFF',
    },

    // Background Colors
    backgrounds: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
      elevated: '#2C2C2E',
      overlay: 'rgba(0,0,0,0.6)',
    },

    // Text Colors
    text: {
      primary: '#FFFFFF',
      secondary: '#EBEBF5',
      tertiary: '#EBEBF599',
      quaternary: '#EBEBF54D',
      inverse: '#000000',
      link: '#0A84FF',
      destructive: '#FF453A',
      success: '#32D74B',
      warning: '#FF9F0A',
    },

    // Brand Colors
    brand: {
      primary: '#FF6B6B',
      secondary: '#4ADE80',
      accent: '#0A84FF',
    },

    // Card Colors
    cards: {
      background: '#2C2C2E',
      border: '#38383A',
      shadow: 'rgba(0,0,0,0.3)',
      overlay: 'rgba(0,0,0,0.5)',
    },

    // Navigation Colors
    navigation: {
      background: '#1C1C1E',
      border: '#38383A',
      active: '#0A84FF',
      inactive: '#8E8E93',
    },

    // Status Colors
    status: {
      error: '#FF453A',
      warning: '#FF9F0A',
      success: '#32D74B',
      info: '#0A84FF',
    },

    // Semantic Colors
    semantic: {
      separator: '#38383A',
      fill: '#48484A',
      disabled: '#8E8E93',
    },
  } as Colors,
};

// Typography System (Apple News Typography)
const typography: Typography = {
  fonts: {
    system: 'System',
    serif: 'Times',
    display: 'System',
  },

  sizes: {
    caption: 12,
    footnote: 13,
    subheadline: 15,
    callout: 16,
    body: 17,
    headline: 17,
    title3: 20,
    title2: 22,
    title1: 28,
    largeTitle: 34,
    display: 40,
  },

  weights: {
    ultraLight: '100',
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900',
  },

  lineHeights: {
    caption: 16,
    footnote: 18,
    subheadline: 20,
    callout: 22,
    body: 22,
    headline: 22,
    title3: 25,
    title2: 28,
    title1: 34,
    largeTitle: 41,
    display: 48,
  },

  // Default body style
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
};

// Spacing System
const spacing: Spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 56,
  '8xl': 64,
};

// Border Radius
const borderRadius: BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows
const shadows = {
  light: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    elevated: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 8,
    }
  },
  dark: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 2,
    },
    elevated: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 8,
    }
  }
};

// Theme Context
const ThemeContext = createContext<Theme | undefined>(undefined);

// Helper function to determine if system is in dark mode
const getSystemTheme = () => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark';
};

// Theme Provider Component - Fixed for reliable system theme detection
export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // Initialize with current system theme
  const [isDarkMode, setIsDarkMode] = useState(() => getSystemTheme());
  
  // Get current system color scheme with useColorScheme hook as backup
  const systemColorScheme = useColorScheme();

  // Primary effect: Listen to system appearance changes
  useEffect(() => {
    console.log('Setting up appearance change listener...');
    
    // Set initial theme based on current system setting
    const currentSystemTheme = getSystemTheme();
    console.log('Initial system theme:', currentSystemTheme ? 'dark' : 'light');
    setIsDarkMode(currentSystemTheme);

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('System theme changed to:', colorScheme);
      const newIsDark = colorScheme === 'dark';
      setIsDarkMode(newIsDark);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up appearance listener');
      subscription?.remove();
    };
  }, []);

  // Secondary effect: Sync with useColorScheme hook changes (fallback)
  useEffect(() => {
    if (systemColorScheme !== null) {
      const hookBasedIsDark = systemColorScheme === 'dark';
      console.log('useColorScheme detected:', systemColorScheme);
      
      // Only update if there's a mismatch (prevents unnecessary re-renders)
      setIsDarkMode(prevState => {
        if (prevState !== hookBasedIsDark) {
          console.log('Syncing with useColorScheme:', hookBasedIsDark ? 'dark' : 'light');
          return hookBasedIsDark;
        }
        return prevState;
      });
    }
  }, [systemColorScheme]);

  // Create theme object
  const currentTheme = isDarkMode ? appleNewsThemes.dark : appleNewsThemes.light;
  const currentShadows = isDarkMode ? shadows.dark : shadows.light;

  const theme: Theme = {
    // Theme state
    isDarkMode,
    themeType: isDarkMode ? "dark" : "light",

    // Theme tokens
    colors: currentTheme,
    typography,
    spacing,
    borderRadius,
    shadows: currentShadows,
    
    // Utility functions
    getTextColor: (variant: keyof Colors['text'] = 'primary') => currentTheme.text[variant],
    getBackgroundColor: (variant: keyof Colors['backgrounds'] = 'primary') => currentTheme.backgrounds[variant],
    getBrandColor: (variant: keyof Colors['brand'] = 'primary') => currentTheme.brand[variant],

    // Component-specific helpers
    cardStyle: {
      backgroundColor: currentTheme.cards.background,
      borderColor: currentTheme.cards.border,
      ...currentShadows.card,
    },
    navigationStyle: {
      backgroundColor: currentTheme.navigation.background,
      borderColor: currentTheme.navigation.border,
    },
  };

  console.log('ThemeProvider rendering with theme:', theme.themeType);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme-aware component helpers
export const createThemedStyles = (styleFunction: (theme: Theme) => any) => {
  return () => {
    const theme = useTheme();
    return styleFunction(theme);
  };
};

// Preset component styles
export const presetStyles = {
  // Card styles
  heroCard: (theme: Theme): ViewStyle => ({
    backgroundColor: theme.colors.cards.background,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden' as const,
    ...theme.shadows.card,
  }),
  
  standardCard: (theme: Theme): ViewStyle => ({
    backgroundColor: theme.colors.cards.background,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden' as const,
    ...theme.shadows.card,
  }),
  
  // Text styles
  headlineText: (theme: Theme): TextStyle => ({
    fontSize: theme.typography.sizes.title1,
    fontWeight: theme.typography.weights.bold as TextStyle['fontWeight'],
    lineHeight: theme.typography.lineHeights.title1,
    color: theme.colors.text.primary,
  }),
  
  bodyText: (theme: Theme): TextStyle => ({
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.regular as TextStyle['fontWeight'],
    lineHeight: theme.typography.lineHeights.body,
    color: theme.colors.text.primary,
  }),
  
  captionText: (theme: Theme): TextStyle => ({
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.regular as TextStyle['fontWeight'],
    lineHeight: theme.typography.lineHeights.caption,
    color: theme.colors.text.tertiary,
  }),
  
  // Section styles
  sectionTitle: (theme: Theme, color: 'primary' | 'red' | 'green' = 'primary'): TextStyle => ({
    fontSize: theme.typography.sizes.title2,
    fontWeight: theme.typography.weights.bold as TextStyle['fontWeight'],
    lineHeight: theme.typography.lineHeights.title2,
    color: color === 'red' ? theme.colors.brand.primary : 
           color === 'green' ? theme.colors.brand.secondary :
           theme.colors.text.primary,
  }),
};

export default ThemeProvider;