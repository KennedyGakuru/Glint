import React from 'react';
import { ViewProps } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface GlIconProps extends ViewProps {
  name: keyof typeof LucideIcons;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function GlIcon({ 
  name, 
  size = 24, 
  color,
  strokeWidth = 1.8, // thinner stroke for Apple-style
  ...props 
}: GlIconProps) {
  const theme = useTheme();
  const IconComponent = LucideIcons[name] as any;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react-native`);
    return null;
  }

  return (
    <IconComponent 
      size={size}
      color={color || theme.colors.text.primary}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
