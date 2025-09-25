import React, { useEffect } from 'react';
import { ScrollView, View, RefreshControl, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useNewsStore } from '../../store/newsStore';
import { GlText } from '../../components/ui/GlText';
import { GlIcon } from '../../components/ui/GlIcon';
import { formatTimeAgo } from '../../lib/utils';
import { useTheme, presetStyles } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

// Article type definition
interface Article {
  id: string;
  title: string;
  author?: string;
  publishedAt: string;
  source: { name: string };
  image?: { url: string };
}

// Hero Article Card Component (for featured stories)
interface HeroArticleCardProps {
  article: Article;
  onPress: () => void;
}

const HeroArticleCard: React.FC<HeroArticleCardProps> = ({ article, onPress }) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        presetStyles.heroCard(theme),
        { 
          marginHorizontal: theme.spacing.xl,
          marginBottom: theme.spacing['3xl'],
        }
      ]}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: article.image?.url }}
          style={{ width: width - 32, height: 240 }}
          resizeMode="cover"
        />
        
        {/* Dark gradient overlay */}
        <View 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: theme.colors.cards.overlay,
          }}
        />
        
        {/* Content overlay */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: theme.spacing.xl
        }}>
          {/* Publisher */}
          <GlText 
            style={{
              ...presetStyles.captionText(theme),
              color: theme.colors.text.inverse,
              fontWeight: theme.typography.weights.semibold,
              marginBottom: theme.spacing.md
            }}
          >
            {article.source.name}
          </GlText>
          
          {/* Headline */}
          <GlText 
            style={{
              ...presetStyles.headlineText(theme),
              color: theme.colors.text.inverse,
              fontSize: theme.typography.sizes.title2,
              lineHeight: theme.typography.lineHeights.title2,
              marginBottom: theme.spacing.md
            }}
            numberOfLines={3}
          >
            {article.title}
          </GlText>
          
          {/* Metadata */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <GlText style={{
              ...presetStyles.captionText(theme),
              color: theme.colors.text.inverse,
              opacity: 0.8
            }}>
              {formatTimeAgo(article.publishedAt)} • {article.author}
            </GlText>
            
            <TouchableOpacity style={{ padding: theme.spacing.sm }}>
              <GlIcon 
                name="MoreHorizontal" 
                size={16} 
                color={theme.colors.text.inverse} 
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Standard Article Card Component
interface StandardArticleCardProps {
  article: Article;
  onPress: () => void;
  showImage?: boolean;
}

const StandardArticleCard: React.FC<StandardArticleCardProps> = ({ 
  article, 
  onPress, 
  showImage = true 
}) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        presetStyles.standardCard(theme),
        { 
          marginHorizontal: theme.spacing.xl,
          marginBottom: theme.spacing.xl,
        }
      ]}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Content */}
        <View style={{ 
          flex: 1, 
          padding: theme.spacing.xl 
        }}>
          {/* Publisher */}
          <GlText style={{
            ...presetStyles.captionText(theme),
            color: theme.colors.text.primary,
            fontWeight: theme.typography.weights.semibold,
            marginBottom: theme.spacing.sm
          }}>
            {article.source.name}
          </GlText>
          
          {/* Headline */}
          <GlText 
            style={{
              ...presetStyles.bodyText(theme),
              fontWeight: theme.typography.weights.semibold,
              fontSize: theme.typography.sizes.callout,
              lineHeight: theme.typography.lineHeights.callout,
              marginBottom: theme.spacing.md
            }}
            numberOfLines={3}
          >
            {article.title}
          </GlText>
          
          {/* Metadata */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <GlText style={{
              ...presetStyles.captionText(theme),
              color: theme.colors.text.tertiary
            }}>
              {formatTimeAgo(article.publishedAt)} • {article.author}
            </GlText>
            
            <TouchableOpacity style={{ padding: theme.spacing.sm }}>
              <GlIcon 
                name="MoreHorizontal" 
                size={14} 
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Image */}
        {showImage && article.image && (
          <View style={{
            width: 96,
            height: 96,
            margin: theme.spacing.xl,
            borderRadius: theme.borderRadius.lg,
            overflow: 'hidden'
          }}>
            <Image
              source={{ uri: article.image.url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Section Component
interface NewsSectionProps {
  title: string;
  articles: Article[];
  variant?: 'standard' | 'hero' | 'compact';
  titleColor?: 'primary' | 'red' | 'green';
}

const NewsSection: React.FC<NewsSectionProps> = ({ 
  title, 
  articles, 
  variant = 'standard', 
  titleColor = 'primary' 
}) => {
  const theme = useTheme();
  
  const handleArticlePress = (article: Article) => {
    router.push(`/article/${encodeURIComponent(article.id)}`);
  };

  if (!articles || articles.length === 0) return null;

  return (
    <View style={{ marginBottom: theme.spacing['4xl'] }}>
      {/* Section Title */}
      <View style={{
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl
      }}>
        <GlText style={presetStyles.sectionTitle(theme, titleColor)}>
          {title}
        </GlText>
        {title === 'For You' && (
          <GlText style={{
            ...presetStyles.captionText(theme),
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.sm
          }}>
            Recommendations based on topics & channels you read.
          </GlText>
        )}
      </View>

      {/* Articles */}
      {variant === 'hero' ? (
        <View>
          {articles.slice(0, 1).map((article) => (
            <HeroArticleCard 
              key={article.id} 
              article={article} 
              onPress={() => handleArticlePress(article)}
            />
          ))}
          {articles.slice(1, 3).map((article) => (
            <StandardArticleCard 
              key={article.id} 
              article={article} 
              onPress={() => handleArticlePress(article)}
            />
          ))}
          {/* More coverage link */}
          <TouchableOpacity style={{
            marginHorizontal: theme.spacing.xl,
            marginBottom: theme.spacing.xl
          }}>
            <GlText style={{
              ...presetStyles.bodyText(theme),
              color: theme.colors.text.secondary
            }}>
              More politics coverage
            </GlText>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {articles.slice(0, 4).map((article) => (
            <StandardArticleCard 
              key={article.id} 
              article={article} 
              onPress={() => handleArticlePress(article)}
              showImage={variant !== 'compact'}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { articles, loadTopStories, loadSection, clearError } = useNewsStore();

  useEffect(() => {
    loadTopStories();
    loadSection('for_you');
    loadSection('world');
    loadSection('technology');
    loadSection('local');
  }, []);

  const handleRefresh = React.useCallback(() => {
    clearError();
    loadTopStories();
    loadSection('for_you');
    loadSection('world');
    loadSection('technology');
    loadSection('local');
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.backgrounds.primary
    }}>
      <StatusBar style={theme.isDarkMode ? "light" : "dark"} />
      <ScrollView
        style={{ 
          paddingTop: insets.top + 10 
        }}
        refreshControl={
          <RefreshControl
            refreshing={articles.loading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.text.secondary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl, 
          paddingBottom: theme.spacing['2xl']
        }}>
          {/* App Title */}
          <View
            style={{
           flexDirection: 'row',
           alignItems: 'center',
           marginBottom: theme.spacing.lg,
           paddingTop: theme.spacing.md,   
             }}
              >
            <GlIcon 
             name="Newspaper" 
            size={28} 
             color={theme.colors.text.primary} 
               />
               <GlText
                style={{
                fontSize: theme.typography.sizes.largeTitle,
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.text.primary,
                marginLeft: theme.spacing.md,
                lineHeight: theme.typography.sizes.largeTitle * 1.2, // prevent clipping
                  }}
                >
                Glint News
               </GlText>
          </View>

          
          {/* Date */}
          <GlText style={{
            ...presetStyles.bodyText(theme),
            color: theme.colors.text.secondary,
            fontSize: theme.typography.sizes.callout
          }}>
            {new Date().toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </GlText>
        </View>

        {/* Error Banner */}
        {articles.error && (
          <View style={{
            paddingHorizontal: theme.spacing.xl,
            marginBottom: theme.spacing.xl
          }}>
            <View style={{
              backgroundColor: theme.colors.status.error + '20',
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.status.error + '30'
            }}>
              <GlText style={{
                ...presetStyles.bodyText(theme),
                color: theme.colors.status.error
              }}>
                {articles.error}
              </GlText>
            </View>
          </View>
        )}

        {/* News Sections */}
        {articles.sections?.top_stories && (
          <NewsSection 
            title="Top Stories" 
            articles={articles.sections.top_stories} 
            variant="hero" 
            titleColor="red" 
          />
        )}

        {articles.sections?.for_you && (
          <NewsSection 
            title="For You" 
            articles={articles.sections.for_you} 
            variant="standard"
            titleColor="green"
          />
        )}

        {articles.sections?.world && (
          <NewsSection 
            title="World" 
            articles={articles.sections.world} 
            variant="standard" 
          />
        )}

        {articles.sections?.technology && (
          <NewsSection 
            title="Technology" 
            articles={articles.sections.technology} 
            variant="standard" 
          />
        )}

        {articles.sections?.local && (
          <NewsSection 
            title="Local" 
            articles={articles.sections.local} 
            variant="compact" 
          />
        )}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: theme.spacing['8xl'] }} />
      </ScrollView>
    </View>
  );
}