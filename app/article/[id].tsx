import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Share, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNewsStore } from '../../store/newsStore';
import { GlText } from '../../components/ui/GlText';
import { GlButton } from '../../components/ui/GlButton';
import { GlIcon } from '../../components/ui/GlIcon';
import { formatTimeAgo } from '../../lib/utils';
import * as WebBrowser from 'expo-web-browser';
import RenderHTML from "react-native-render-html";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  const {
    articles,
    user,
    saveArticle,
    unsaveArticle,
  } = useNewsStore();

  const { width } = Dimensions.get("window");

  // Find article in all sections
  const article = React.useMemo(() => {
    const allArticles = [
      ...Object.values(articles.sections).flat(),
      ...articles.saved,
      ...articles.downloaded,
      ...articles.history,
    ];
    return allArticles.find(a => a.id === decodeURIComponent(id as string));
  }, [id, articles]);

  useEffect(() => {
    // Set status bar style for dark header
    StatusBar.setBarStyle('light-content', true);
    return () => {
      StatusBar.setBarStyle('dark-content', true);
    };
  }, []);

  if (!article) {
    return (
      <View className="flex-1 bg-bg-light dark:bg-bg-dark items-center justify-center">
        <GlText variant="title">Article not found</GlText>
        <GlButton onPress={() => router.back()} className="mt-4">
          Go Back
        </GlButton>
      </View>
    );
  }

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title} - ${article.url}`,
        url: article.url,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleOpenSource = async () => {
    if (article?.url) {
      try {
        await WebBrowser.openBrowserAsync(article.url);
      } catch (error) {
        console.error("Failed to open browser:", error);
      }
    }
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderVisible(offsetY > 200);
  };

  const isSaved = user.savedArticles?.includes(article.id);

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveArticle(article.id);
    } else {
      saveArticle(article);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Fixed Header Overlay */}
      <View
        className="absolute top-0 left-0 right-0 z-50"
        style={{ 
          paddingTop: insets.top,
          backgroundColor: isHeaderVisible ? 'rgba(0,0,0,0.9)' : 'transparent'
        }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          {/* Back button */}
          <TouchableOpacity 
            onPress={handleBack} 
            className="w-9 h-9 rounded-full bg-black/20 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <GlIcon name="ChevronLeft" size={20} color="white" />
          </TouchableOpacity>

          {/* Publisher - only show when header is visible */}
          {isHeaderVisible && (
            <GlText variant="body" weight="semibold" style={{ color: 'white' }}>
              {article.source.name}
            </GlText>
          )}
          {!isHeaderVisible && <View />}

          {/* More options */}
          <TouchableOpacity 
            onPress={() => {}} 
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <GlIcon name="MoreHorizontal" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Image */}
        <View className="relative">
          {article.image && (
            <>
              <Image
                source={{ uri: article.image.url }}
                className="w-full"
                style={{ height: width * 0.75 }} // 4:3 aspect ratio
                resizeMode="cover"
              />
              {/* Gradient overlay */}
              <View 
                className="absolute bottom-0 left-0 right-0"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  height: 120,
                }}
              />
            </>
          )}

          {/* Article Header Content Overlay */}
          <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
            {/* Publisher name */}
            <GlText variant="body" weight="semibold" className="mb-2" style={{ color: 'white' }}>
              {article.source.name}
            </GlText>
            
            {/* Headline */}
            <GlText 
              variant="title" 
              weight="bold" 
              className="mb-3 leading-tight"
              style={{ 
                color: 'white',
                fontSize: 28,
                lineHeight: 34,
              }}
            >
              {article.title}
            </GlText>

            {/* Subtitle/Excerpt */}
            {article.excerpt && (
              <GlText 
                variant="body" 
                className="mb-4 opacity-90"
                style={{ 
                  color: 'white',
                  fontSize: 16,
                  lineHeight: 22,
                }}
              >
                {article.excerpt}
              </GlText>
            )}

            {/* Metadata */}
            <View className="flex-row items-center justify-between">
              <View>
                {article.author && (
                  <GlText variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    By {article.author}
                  </GlText>
                )}
                <GlText variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {formatTimeAgo(article.publishedAt)} • 5 min read
                </GlText>
              </View>

              {/* Action buttons */}
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity 
                  onPress={handleToggleSave}
                  className="w-8 h-8 rounded-full bg-black/30 items-center justify-center"
                >
                  <GlIcon 
                    name={isSaved ? "Bookmark" : "BookmarkPlus"} 
                    size={16} 
                    color="white" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleShare}
                  className="w-8 h-8 rounded-full bg-black/30 items-center justify-center"
                >
                  <GlIcon name="Share" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Article Body */}
        <View className="bg-white">
          <View className="px-4 py-8">
            {/* Supply line or excerpt continuation */}
            <GlText 
              variant="body" 
              className="mb-6 font-medium"
              style={{ 
                fontSize: 18,
                lineHeight: 26,
                color: '#374151'
              }}
            >
              Supply Lines is a daily newsletter that tracks global trade. Sign up here.
            </GlText>

            {/* Article content */}
            {article.body ? (
              <View>
                <RenderHTML
                  contentWidth={width - 32}
                  source={{ html: article.body }}
                  baseStyle={{
                    fontSize: user.preferences.fontSize === "small" ? 16 :
                            user.preferences.fontSize === "medium" ? 17 :
                            user.preferences.fontSize === "large" ? 18 : 19,
                    lineHeight: user.preferences.fontSize === "small" ? 24 :
                              user.preferences.fontSize === "medium" ? 26 :
                              user.preferences.fontSize === "large" ? 28 : 30,
                    color: "#111827",
                    fontFamily: "Georgia", // Serif font like Apple News
                  }}
                  tagsStyles={{
                    p: { 
                      marginBottom: 16,
                      fontSize: user.preferences.fontSize === "small" ? 16 :
                                user.preferences.fontSize === "medium" ? 17 :
                                user.preferences.fontSize === "large" ? 18 : 19,
                      lineHeight: user.preferences.fontSize === "small" ? 24 :
                                user.preferences.fontSize === "medium" ? 26 :
                                user.preferences.fontSize === "large" ? 28 : 30,
                    },
                    h1: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, marginTop: 24 },
                    h2: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, marginTop: 20 },
                    h3: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 16 },
                  }}
                />
              </View>
            ) : (
              <View className="bg-gray-50 rounded-lg p-6 mt-6">
                <GlText variant="body" className="mb-4 text-center">
                  Continue reading the full article at the source
                </GlText>
                <GlButton 
                  onPress={handleOpenSource}
                  className="bg-blue-600"
                >
                  Read Full Article
                </GlButton>
              </View>
            )}

            {/* Bottom actions */}
            <View className="mt-12 pt-8 border-t border-gray-200">
              <View className="flex-row items-center justify-center space-x-8">
                <TouchableOpacity 
                  onPress={handleToggleSave}
                  className="flex-row items-center space-x-2"
                >
                  <GlIcon 
                    name={isSaved ? "Bookmark" : "BookmarkPlus"} 
                    size={20} 
                    color={isSaved ? "#3B82F6" : "#6B7280"} 
                  />
                  <GlText variant="body" color={isSaved ? "accent" : "muted"}>
                    {isSaved ? "Saved" : "Save"}
                  </GlText>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleShare}
                  className="flex-row items-center space-x-2"
                >
                  <GlIcon name="Share" size={20} color="#6B7280" />
                  <GlText variant="body" color="muted">Share</GlText>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {}}
                  className="flex-row items-center space-x-2"
                >
                  <GlIcon name="ThumbsUp" size={20} color="#6B7280" />
                  <GlText variant="body" color="muted">Like</GlText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}