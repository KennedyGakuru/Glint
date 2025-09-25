import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '../../lib/utils';

interface GlTextProps extends TextProps {
  variant?: 'display' | 'headline' | 'title' | 'body' | 'caption';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'accent' | 'inverse' | 'red';
}

export function GlText({
  variant = 'body',
  weight = 'normal',
  color = 'default',
  className,
  children,
  ...props
}: GlTextProps) {
  const variantStyles = {
    display: 'text-4xl font-extrabold tracking-tight',
    headline: 'text-xl font-bold',
    title: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-xs tracking-wide',
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorStyles = {
    default: 'text-white',
    muted: 'text-gray-400',
    accent: 'text-blue-500',
    inverse: 'text-black',
    red: 'text-red-500',
  };

  return (
    <Text
      className={cn(
        variantStyles[variant],
        weightStyles[weight],
        colorStyles[color],
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}
