import React from 'react';
import { View } from 'react-native';
import { cn } from '../../lib/utils';
import { GlText } from './GlText';

interface GlBadgeProps {
  variant?: 'default' | 'accent' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function GlBadge({ 
  variant = 'default',
  size = 'md',
  className,
  children 
}: GlBadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 dark:bg-gray-800',
    accent: 'bg-accent/10 border border-accent/20',
    secondary: 'bg-brand/10 border border-brand/20',
    outline: 'border border-gray-200 dark:border-gray-700 bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
  };

  const textColors = {
    default: 'text-ink dark:text-white',
    accent: 'text-accent',
    secondary: 'text-brand',
    outline: 'text-ink dark:text-white',
  };

  return (
    <View className={cn(
      'rounded-full items-center justify-center',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {typeof children === 'string' ? (
        <GlText variant="caption" className={cn('font-medium', textColors[variant])}>
          {children}
        </GlText>
      ) : (
        children
      )}
    </View>
  );
}