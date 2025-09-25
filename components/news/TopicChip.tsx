import React from 'react';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlText } from '../../components/ui/GlText';
import { GlIcon } from '../../components/ui/GlIcon';
import { cn } from '../../lib/utils';
import { Topic } from '../../types/news';

interface TopicChipProps {
  topic: Topic;
  followed?: boolean;
  onToggle?: (topicId: string) => void;
  variant?: 'default' | 'toggle';
}

export function TopicChip({ 
  topic, 
  followed = false, 
  onToggle,
  variant = 'default'
}: TopicChipProps) {
  const handlePress = () => {
    if (onToggle) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle(topic.id);
    }
  };

  if (variant === 'toggle') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className={cn(
          'flex-row items-center px-4 py-2 rounded-full mr-2 mb-2',
          followed 
            ? 'bg-brand border-brand' 
            : 'bg-transparent border border-gray-300 dark:border-gray-600'
        )}
      >
        <GlText 
          variant="body" 
          className={cn(
            'font-medium',
            followed ? 'text-white' : 'text-ink dark:text-white'
          )}
        >
          {topic.name}
        </GlText>
        {followed && (
          <GlIcon name="Check" size={16} color="white" className="ml-1" />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full mr-2"
    >
      <GlText variant="caption" className="font-medium">
        {topic.name}
      </GlText>
    </TouchableOpacity>
  );
}