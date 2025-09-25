import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  RefreshControl,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNewsStore } from '../../store/newsStore';
import { useTheme } from '../../contexts/ThemeContext';
import { GlText } from '../../components/ui/GlText';
import { GlIcon } from '../../components/ui/GlIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AppleNewsSportsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  type LiveScore = {
    id: string;
    homeTeam: { name: string; score: number; logo: string };
    awayTeam: { name: string; score: number; logo: string };
    status: string;
    time: string;
    league: string;
  };
  
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);

  const {
    articles: { sections = {}, loading = false, error } = {},
    loadSportsNews,
  } = useNewsStore();

  const sportsArticles = sections.sports || [];

  // Live scores mock data (replace with real API)
  const mockLiveScores = [
    {
      id: '1',
      homeTeam: { name: 'LIV', score: 2, logo: '⚽' },
      awayTeam: { name: 'NEW', score: 1, logo: '⚽' },
      status: 'FINAL',
      time: '90+5',
      league: 'EPL'
    },
    {
      id: '2',
      homeTeam: { name: 'MAN', score: 1, logo: '⚽' },
      awayTeam: { name: 'CHE', score: 1, logo: '⚽' },
      status: 'LIVE',
      time: '67\'',
      league: 'EPL'
    }
  ];

  useEffect(() => {
    loadSportsNews();
    setLiveScores(mockLiveScores);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSportsNews();
    // Simulate fetching live scores
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLiveScores(mockLiveScores);
    setRefreshing(false);
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp'
  });

  const LiveScoreCard = ({ score }: { score: LiveScore }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.cards.background,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        minWidth: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
      }}
      activeOpacity={0.95}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <GlText style={{
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.brand.primary,
          textTransform: 'uppercase'
        }}>
          {score.league}
        </GlText>
        <View style={{
          backgroundColor: score.status === 'LIVE' ? '#FF3B30' : theme.colors.text.secondary,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4
        }}>
          <GlText style={{
            fontSize: 10,
            fontWeight: '600',
            color: 'white'
          }}>
            {score.status === 'LIVE' ? 'LIVE' : 'FINAL'}
          </GlText>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <GlText style={{ fontSize: 24, marginBottom: 4 }}>{score.homeTeam.logo}</GlText>
          <GlText style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text.primary
          }}>
            {score.homeTeam.name}
          </GlText>
        </View>
        
        <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GlText style={{
              fontSize: 24,
              fontWeight: '700',
              color: theme.colors.text.primary
            }}>
              {score.homeTeam.score}
            </GlText>
            <GlText style={{
              fontSize: 18,
              color: theme.colors.text.secondary,
              marginHorizontal: 8
            }}>
              -
            </GlText>
            <GlText style={{
              fontSize: 24,
              fontWeight: '700',
              color: theme.colors.text.primary
            }}>
              {score.awayTeam.score}
            </GlText>
          </View>
          <GlText style={{
            fontSize: 12,
            color: theme.colors.text.secondary,
            marginTop: 4
          }}>
            {score.time}
          </GlText>
        </View>
        
        <View style={{ flex: 1, alignItems: 'center' }}>
          <GlText style={{ fontSize: 24, marginBottom: 4 }}>{score.awayTeam.logo}</GlText>
          <GlText style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text.primary
          }}>
            {score.awayTeam.name}
          </GlText>
        </View>
      </View>
    </TouchableOpacity>
  );

  type Article = {
    id?: string;
    source?: { name?: string };
    publishedAt?: string | number | Date;
    title: string;
    description?: string;
    // Add other fields as needed
  };

  const NewsCard = ({ article, isLarge = false }: { article: Article; isLarge?: boolean }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.cards.background,
        borderRadius: isLarge ? 16 : 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
      }}
      activeOpacity={0.95}
    >
      <View style={{
        height: isLarge ? 240 : 180,
        backgroundColor: theme.colors.backgrounds.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <GlIcon name="Image" size={48} color={theme.colors.text.tertiary} />
        
        {/* Sport category badge */}
        <View style={{
          position: 'absolute',
          top: 12,
          left: 12,
          backgroundColor: 'rgba(0,0,0,0.7)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6
        }}>
          <GlText style={{
            fontSize: 12,
            fontWeight: '600',
            color: 'white'
          }}>
            SPORTS
          </GlText>
        </View>
      </View>
      
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 16,
            height: 16,
            backgroundColor: theme.colors.brand.primary,
            borderRadius: 2,
            marginRight: 8
          }} />
          <GlText style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text.primary
          }}>
            {article.source?.name || 'Sports News'}
          </GlText>
          <GlText style={{
            fontSize: 12,
            color: theme.colors.text.secondary,
            marginLeft: 'auto'
          }}>
            {new Date(article.publishedAt || Date.now()).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </GlText>
        </View>
        
        <GlText style={{
          fontSize: isLarge ? 20 : 18,
          fontWeight: '700',
          color: theme.colors.text.primary,
          lineHeight: isLarge ? 26 : 24,
          marginBottom: 8
        }}>
          {article.title}
        </GlText>
        
        {article.description && (
          <GlText style={{
            fontSize: 14,
            color: theme.colors.text.secondary,
            lineHeight: 20,
            marginBottom: 8
          }}>
            {article.description.substring(0, 120)}...
          </GlText>
        )}
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GlIcon name="Share" size={16} color={theme.colors.brand.primary} />
            <GlText style={{
              fontSize: 14,
              color: theme.colors.brand.primary,
              marginLeft: 4,
              fontWeight: '500'
            }}>
              Share
            </GlText>
          </TouchableOpacity>
          
          <TouchableOpacity>
            <GlIcon name="MoreHorizontal" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MyTeamsSection = () => (
    <View style={{ marginBottom: 24 }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 16
      }}>
        <GlText style={{
          fontSize: 22,
          fontWeight: '700',
          color: theme.colors.text.primary
        }}>
          My Sports
        </GlText>
        <TouchableOpacity>
          <GlText style={{
            fontSize: 16,
            color: theme.colors.brand.primary,
            fontWeight: '500'
          }}>
            Manage
          </GlText>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', marginRight: 16 }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#C8102E',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <GlText style={{ 
                fontSize: 16, 
                fontWeight: '700',
                color: 'white'
              }}>
                LIV
              </GlText>
            </View>
            <GlText style={{
              fontSize: 12,
              color: theme.colors.text.secondary,
              fontWeight: '600'
            }}>
              Liverpool
            </GlText>
          </View>
          
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.backgrounds.secondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
              borderWidth: 2,
              borderColor: theme.colors.semantic.separator,
              borderStyle: 'dashed'
            }}>
              <GlIcon name="Plus" size={24} color={theme.colors.brand.primary} />
            </View>
            <GlText style={{
              fontSize: 12,
              color: theme.colors.brand.primary,
              fontWeight: '600'
            }}>
              Add More
            </GlText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.backgrounds.primary
    }}>
      <StatusBar 
        barStyle={theme.isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Animated Header */}
      <Animated.View style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: theme.colors.backgrounds.primary,
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslateY }],
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.semantic.separator + '20'
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <View>
            <GlText style={{
              fontSize: 32,
              fontWeight: '800',
              color: theme.colors.text.primary,
              letterSpacing: -0.5
            }}>
              Sport
            </GlText>
          </View>
          
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.backgrounds.secondary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <GlIcon name="Filter" size={16} color={theme.colors.brand.primary} style={{ marginRight: 6 }} />
            <GlText style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.brand.primary
            }}>
              All Sports
            </GlText>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.brand.primary}
            colors={[theme.colors.brand.primary]}
            progressBackgroundColor={theme.colors.cards.background}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <MyTeamsSection />
        
        {/* Live Scores Section */}
        {liveScores.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 16,
              paddingHorizontal: 16
            }}>
              <GlText style={{
                fontSize: 22,
                fontWeight: '700',
                color: theme.colors.text.primary
              }}>
                Live Scores
              </GlText>
              <TouchableOpacity>
                <GlText style={{
                  fontSize: 16,
                  color: theme.colors.brand.primary,
                  fontWeight: '500'
                }}>
                  See All
                </GlText>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
              {liveScores.map(score => (
                <LiveScoreCard key={score.id} score={score} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* For You Section */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ 
            paddingHorizontal: 16,
            marginBottom: 16
          }}>
            <GlText style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.colors.text.primary
            }}>
              For You
            </GlText>
            <GlText style={{
              fontSize: 16,
              color: theme.colors.text.secondary,
              marginTop: 2
            }}>
              Personalized sports news based on your teams
            </GlText>
          </View>
          
          <View style={{ paddingHorizontal: 16 }}>
            {sportsArticles.slice(0, 1).map((article, index) => (
              <NewsCard key={article.id || index} article={article} isLarge={true} />
            ))}
            
            {sportsArticles.slice(1, 4).map((article, index) => (
              <NewsCard key={article.id || index} article={article} />
            ))}
          </View>
        </View>

        {/* Top Stories Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <GlText style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.colors.text.primary
            }}>
              Top Stories
            </GlText>
            <TouchableOpacity>
              <GlText style={{
                fontSize: 16,
                color: theme.colors.brand.primary,
                fontWeight: '500'
              }}>
                See More
              </GlText>
            </TouchableOpacity>
          </View>
          
          {sportsArticles.slice(4).map((article, index) => (
            <NewsCard key={article.id || index} article={article} />
          ))}
          
          {/* Loading state */}
          {loading && (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center', 
              paddingVertical: 40 
            }}>
              <GlText style={{
                fontSize: 16,
                color: theme.colors.text.secondary
              }}>
                Loading sports news...
              </GlText>
            </View>
          )}
          
          {/* Error state */}
          {error && (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center', 
              paddingVertical: 40,
              backgroundColor: theme.colors.backgrounds.secondary,
              borderRadius: 12,
              margin: 16
            }}>
              <GlIcon name="AlertCircle" size={32} color={theme.colors.semantic.error} style={{ marginBottom: 8 }} />
              <GlText style={{
                fontSize: 16,
                color: theme.colors.text.primary,
                textAlign: 'center',
                marginBottom: 4
              }}>
                Unable to load sports news
              </GlText>
              <GlText style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                textAlign: 'center'
              }}>
                {error}
              </GlText>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}