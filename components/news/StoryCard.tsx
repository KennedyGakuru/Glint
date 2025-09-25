import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Article } from '../../types/news';
import { GlText } from '../../components/ui/GlText';
import { GlIcon } from '../../components/ui/GlIcon';
import { useNewsStore } from '../../store/newsStore';
import { formatDistanceToNow } from 'date-fns';

interface StoryCardProps {
  article: Article;
  variant?: 'hero' | 'standard' | 'compact';
  showImage?: boolean;
}

export function StoryCard({
  article,
  variant = 'standard',
  showImage = true,
}: StoryCardProps) {
  const { saveArticle, unsaveArticle, addToHistory } = useNewsStore();
  const isSaved = useNewsStore((state) =>
    state.articles.saved.some((a) => a.id === article.id)
  );

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToHistory(article);
    router.push(`/article/${encodeURIComponent(article.id)}`);
  };

  const handleSavePress = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSaved) {
      unsaveArticle(article.id);
    } else {
      saveArticle(article);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
  });

  /** ------------------ HERO CARD ------------------ **/
  if (variant === 'hero') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="w-full h-96 rounded-2xl overflow-hidden bg-black"
        activeOpacity={0.95}
      >
        {article.image && showImage && (
          <Image
            source={{ uri: article.image.url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
        <View className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <View className="absolute bottom-0 left-0 right-0 p-6">
          <GlText variant="caption" color="muted" className="mb-1">
            {article.source.name} • {timeAgo}
          </GlText>
          <GlText
            variant="headline"
            color="inverse"
            weight="bold"
            numberOfLines={3}
          >
            {article.title}
          </GlText>
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSavePress}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
        >
          <GlIcon
            name={isSaved ? 'Bookmark' : 'BookmarkPlus'}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  /** ------------------ COMPACT CARD ------------------ **/
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="flex-row items-center px-4 py-3 mb-2"
        activeOpacity={0.9}
      >
        <View className="flex-1 mr-3">
          <GlText variant="title" numberOfLines={2} weight="semibold">
            {article.title}
          </GlText>
          <GlText variant="caption" color="muted" className="mt-1">
            {article.source.name} • {timeAgo}
          </GlText>
        </View>

        {article.image && showImage && (
          <Image
            source={{ uri: article.image.url }}
            className="w-20 h-20 rounded-lg"
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  }

  /** ------------------ STANDARD CARD ------------------ **/
  return (
    <TouchableOpacity
      onPress={handlePress}
      className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 mb-4"
      activeOpacity={0.95}
    >
      {article.image && showImage && (
        <Image
          source={{ uri: article.image.url }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        <GlText variant="title" weight="semibold" numberOfLines={2}>
          {article.title}
        </GlText>
        <GlText variant="caption" color="muted" className="mt-2">
          {article.source.name} • {timeAgo}
        </GlText>
      </View>

      {/* Save button */}
      <TouchableOpacity
        onPress={handleSavePress}
        className="absolute top-3 right-3 w-8 h-8 bg-black/30 rounded-full items-center justify-center"
      >
        <GlIcon
          name={isSaved ? 'Bookmark' : 'BookmarkPlus'}
          size={16}
          color="white"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
