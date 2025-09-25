import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNewsStore } from '../../store/newsStore';
import { GlText } from '../../components/ui/GlText';
import { StoryCard } from '../../components/news/StoryCard';
import { useTheme } from '../../contexts/ThemeContext';

export default function SavedStoriesScreen() {
  const insets = useSafeAreaInsets();
  const { articles } = useNewsStore();
  const theme = useTheme();
  const savedArticles = articles.saved;

  return (
    <ScrollView
      style={{ 
        flex: 1, 
        backgroundColor: theme.colors.backgrounds.primary 
      }}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <StatusBar style={theme.isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={{
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.semantic.separator,
      }}>
        <GlText style={{
          fontSize: theme.typography.sizes.largeTitle,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.primary,
        }}>
          Saved Stories
        </GlText>
        <GlText style={{
          fontSize: theme.typography.sizes.subheadline,
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.xs,
        }}>
          Your saved articles
        </GlText>
      </View>

      {/* Content */}
      <View style={{ padding: theme.spacing.xl }}>
        {savedArticles.length > 0 ? (
          <>
            <GlText style={{
              fontSize: theme.typography.sizes.title3,
              fontWeight: theme.typography.weights.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.lg,
            }}>
              Saved Articles ({savedArticles.length})
            </GlText>
            {savedArticles.map((article) => (
              <StoryCard
                key={article.id}
                article={article}
              />
            ))}
          </>
        ) : (
          <View style={{
            alignItems: 'center',
            paddingVertical: theme.spacing['4xl'],
          }}>
            <GlText style={{
              fontSize: theme.typography.sizes.title3,
              fontWeight: theme.typography.weights.medium,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginBottom: theme.spacing.md,
            }}>
              No saved stories yet
            </GlText>
            <GlText style={{
              fontSize: theme.typography.sizes.subheadline,
              color: theme.colors.text.tertiary,
              textAlign: 'center',
            }}>
              Save articles to read them later
            </GlText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}