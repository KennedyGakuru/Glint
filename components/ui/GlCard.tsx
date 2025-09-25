import React from 'react';
import { View, ViewProps, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { cn } from '../../lib/utils';

interface GlCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outline';
  pressable?: boolean;
  onPress?: () => void;
}

export function GlCard({ 
  variant = 'default',
  pressable = false,
  onPress,
  className,
  children,
  ...props 
}: GlCardProps) {
  const variantStyles = {
    default: 'bg-card-light dark:bg-card-dark',
    elevated: 'bg-card-light dark:bg-card-dark shadow-lg',
    outline: 'bg-transparent border border-gray-200 dark:border-gray-700',
  };

  const baseStyles = 'rounded-card p-4';

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={cn(
          baseStyles,
          variantStyles[variant],
          'active:opacity-90',
          className
        )}
        {...props as TouchableOpacityProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View 
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}