import React from 'react';
import { View, ScrollView } from 'react-native';
import { GlText } from '../../components/ui/GlText';
import { StoryCard } from './StoryCard';
import { Article } from '../../types/news';

interface SectionRailProps {
  title: string;
  articles: Article[];
  variant?: 'hero' | 'standard' | 'compact';
  titleColor?: 'default' | 'red';
}

export function SectionRail({
  title,
  articles,
  variant = 'standard',
  titleColor = 'default',
}: SectionRailProps) {
  if (!articles.length) return null;

  return (
    <View className="mb-8">
      {/* Section Title */}
      <View className="px-4 mb-4">
        <GlText
          variant="headline"
          weight="bold"
          color={titleColor === 'red' ? 'red' : 'default'}
        >
          {title}
        </GlText>
      </View>

      {variant === 'hero' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="space-x-4"
        >
          {articles.slice(0, 5).map((article) => (
            <View key={article.id} className="w-80 mr-4">
              <StoryCard article={article} variant="hero" />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="px-4">
          {articles
            .slice(0, variant === 'compact' ? 8 : 4)
            .map((article) => (
              <StoryCard
                key={article.id}
                article={article}
                variant={variant}
              />
            ))}
        </View>
      )}
    </View>
  );
}
