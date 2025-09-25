import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '../../lib/utils';
import { GlText } from './GlText';

interface GlButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  haptic?: boolean;
}

export function GlButton({ 
  variant = 'primary',
  size = 'md', 
  haptic = true,
  onPress,
  className,
  children,
  disabled,
  ...props 
}: GlButtonProps) {
  const handlePress = (event: any) => {
    if (haptic && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const variantStyles = {
    primary: 'bg-brand rounded-card',
    secondary: 'bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-card',
    ghost: 'bg-transparent',
    destructive: 'bg-red-500 rounded-card',
  };

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textColor = {
    primary: 'text-white',
    secondary: 'text-ink dark:text-white',
    ghost: 'text-brand',
    destructive: 'text-white',
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        variantStyles[variant],
        sizeStyles[size],
        disabled ? 'opacity-50' : undefined,
        'items-center justify-center',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? (
        <GlText className={cn(textColor[variant], 'font-medium')}>
          {children}
        </GlText>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}