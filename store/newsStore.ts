import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types/store';
import { Article, Topic, Publisher } from '../types/news';

// Provider imports - easily extensible
import { GuardianProvider } from '../services/guardianProvider';
import { NYTProvider } from '@/services/nytProvider';
import { DemoProvider } from '@/services/demoProvider';

interface NewsStore extends AppState {
  searchNews: (query: string) => Promise<void>;
  loadTopStories: () => Promise<void>;
  loadSection: (sectionType: string) => Promise<void>;
  loadSportsNews: () => Promise<void>; // New sports-specific loader
  saveArticle: (article: Article) => void;
  unsaveArticle: (articleId: string) => void;
  downloadArticle: (article: Article) => void;
  removeDownload: (articleId: string) => void;
  addToHistory: (article: Article) => void;
  followTopic: (topicId: string) => void;
  unfollowTopic: (topicId: string) => void;
  followPublisher: (publisherId: string) => void;
  unfollowPublisher: (publisherId: string) => void;
  updatePreferences: (preferences: Partial<AppState['user']['preferences']>) => void;
  performSearch: (query: string) => Promise<void>;
  loadTopics: () => Promise<void>;
  loadPublishers: () => Promise<void>;
  clearError: () => void;
  clearSearch: () => void; // New function to clear search results
}

// =====================================================
// PROVIDER MANAGEMENT SYSTEM - Scalable Architecture
// =====================================================

interface ProviderConfig {
  instance: any;
  priority: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  features: {
    topStories: boolean;
    search: boolean;
    topics: boolean;
    localNews: boolean;
    publishers: boolean;
    sports: boolean; // New feature flag
  };
}

// Provider registry - easy to add new providers
const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    instance: new DemoProvider(),
    priority: 0, // Fallback only
    rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 },
    features: { topStories: true, search: true, topics: true, localNews: false, publishers: true, sports: true }
  },
  {
    instance: new GuardianProvider(process.env.EXPO_PUBLIC_GUARDIAN_API_KEY),
    priority: 2, // High priority - better rate limits
    rateLimit: { requestsPerMinute: 12, requestsPerDay: 5000 },
    features: { topStories: true, search: true, topics: true, localNews: true, publishers: true, sports: true }
  },
  {
    instance: new NYTProvider(process.env.EXPO_PUBLIC_NYT_API_KEY),
    priority: 1, // Lower priority due to stricter limits
    rateLimit: { requestsPerMinute: 5, requestsPerDay: 1000 },
    features: { topStories: true, search: true, topics: true, localNews: true, publishers: false, sports: true }
  }
];

// =====================================================
// ENHANCED PROVIDER MANAGEMENT
// =====================================================

class ProviderManager {
  private static instance: ProviderManager;
  private cooldowns = new Map<string, number>();
  private failureCounts = new Map<string, number>();
  private requestCounts = new Map<string, { minute: number, day: number, lastReset: number }>();

  static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  getActiveProviders(feature?: keyof ProviderConfig['features']): ProviderConfig[] {
    return PROVIDER_CONFIGS
      .filter(config => {
        // Skip demo provider unless it's the only option
        if (config.instance instanceof DemoProvider && config.priority === 0) {
          return false;
        }

        // Check if provider is available
        if (!this.isProviderAvailable(config)) return false;

        // Check if provider supports the required feature
        if (feature && !config.features[feature]) return false;

        // Check cooldowns and rate limits
        return !this.isOnCooldown(config) && !this.isRateLimited(config);
      })
      .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
  }

  private isProviderAvailable(config: ProviderConfig): boolean {
    const provider = config.instance;
    
    if (typeof provider.isAvailable === 'function') {
      return provider.isAvailable();
    }

    // Check API keys for specific providers
    if (provider instanceof GuardianProvider) {
      return !!process.env.EXPO_PUBLIC_GUARDIAN_API_KEY;
    }
    if (provider instanceof NYTProvider) {
      return !!process.env.EXPO_PUBLIC_NYT_API_KEY;
    }

    return true;
  }

  private isOnCooldown(config: ProviderConfig): boolean {
    const providerName = config.instance.constructor.name;
    const cooldownUntil = this.cooldowns.get(providerName);
    
    if (cooldownUntil && Date.now() < cooldownUntil) {
      console.log(`⏰ ${providerName} on cooldown until ${new Date(cooldownUntil).toLocaleTimeString()}`);
      return true;
    }
    return false;
  }

  private isRateLimited(config: ProviderConfig): boolean {
    const providerName = config.instance.constructor.name;
    const counts = this.requestCounts.get(providerName);
    
    if (!counts) return false;

    const now = Date.now();
    const minutesPassed = (now - counts.lastReset) / (60 * 1000);
    const daysPassed = (now - counts.lastReset) / (24 * 60 * 60 * 1000);

    // Reset counters if time has passed
    if (minutesPassed >= 1) {
      counts.minute = 0;
    }
    if (daysPassed >= 1) {
      counts.day = 0;
      counts.lastReset = now;
    }

    // Check limits
    return counts.minute >= config.rateLimit.requestsPerMinute || 
           counts.day >= config.rateLimit.requestsPerDay;
  }

  setCooldown(providerName: string, minutes: number = 10): void {
    const cooldownUntil = Date.now() + (minutes * 60 * 1000);
    this.cooldowns.set(providerName, cooldownUntil);
    console.log(`🚫 ${providerName} cooldown set for ${minutes} minutes`);
  }

  recordRequest(providerName: string): void {
    const counts = this.requestCounts.get(providerName) || 
                  { minute: 0, day: 0, lastReset: Date.now() };
    
    counts.minute++;
    counts.day++;
    this.requestCounts.set(providerName, counts);
  }

  handleError(providerName: string, error: any): void {
    const currentCount = this.failureCounts.get(providerName) || 0;
    this.failureCounts.set(providerName, currentCount + 1);
    
    console.error(`${providerName} failure ${currentCount + 1}:`, error?.message || error);

    // Dynamic cooldown based on error type
    if (error?.message?.includes('rate limit') || error?.status === 429) {
      this.setCooldown(providerName, 15); // Longer cooldown for rate limits
    } else if (currentCount >= 2) {
      this.setCooldown(providerName, 5);
    }

    // Reset failure count after cooldown
    setTimeout(() => {
      this.failureCounts.set(providerName, 0);
    }, 15 * 60 * 1000);
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const deduplicateArticles = (articles: Article[]): Article[] => {
  const seen = new Set<string>();
  return articles.filter(article => {
    const key = `${article.title?.toLowerCase().trim()}-${article.source.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const fairDistribution = (providerResults: { provider: string; articles: Article[] }[]): Article[] => {
  const maxLength = Math.max(...providerResults.map(r => r.articles.length));
  const distributed: Article[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    for (const result of providerResults) {
      if (result.articles[i]) {
        distributed.push(result.articles[i]);
      }
    }
  }
  
  return distributed;
};

// Enhanced request executor with better rate limiting
const executeProviderRequests = async (
  requests: Array<() => Promise<Article[]>>,
  delayMs = 2000 // Increased delay to 2 seconds
): Promise<Article[][]> => {
  const results: Article[][] = [];
  
  for (const request of requests) {
    try {
      const result = await request();
      results.push(result || []);
    } catch (error) {
      console.warn('Provider request failed:', error);
      results.push([]);
    }
    
    // Add delay between requests to respect rate limits
    if (request !== requests[requests.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
};

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

const defaultPreferences = {
  theme: 'system' as const,
  fontSize: 'medium' as const,
  lineHeight: 'normal' as const,
  followedTopics: ['technology', 'world'],
  followedPublishers: [],
  notificationSettings: {
    breaking: true,
    digest: true,
    topics: [],
  },
  downloadSettings: {
    wifiOnly: true,
    autoRemoveAfter: 30,
    maxArticles: 50,
  },
};

export const useNewsStore = create<NewsStore>()(
  persist(
    (set, get) => {
      const providerManager = ProviderManager.getInstance();

      return {
        user: {
          preferences: defaultPreferences,
          isAuthenticated: false,
        },
        articles: {
          sections: {},
          saved: [],
          downloaded: [],
          history: [],
          loading: false,
        },
        topics: {
          available: [],
          followed: [],
          loading: false,
        },
        publishers: {
          available: [],
          followed: [],
          loading: false,
        },
        search: {
          results: [],
          recentQueries: [],
          loading: false,
        },

        // =====================================================
        // MAIN LOADING FUNCTIONS
        // =====================================================

        searchNews: async (query: string) => {
          set(state => ({ search: { ...state.search, loading: true, error: undefined } }));

          try {
            const activeProviders = providerManager.getActiveProviders('search');
            
            if (activeProviders.length === 0) {
              throw new Error('No providers available for search');
            }

            console.log(`🔍 Searching "${query}" across:`, activeProviders.map(p => p.instance.constructor.name).join(', '));

            const resultsPerProvider = Math.ceil(20 / activeProviders.length);
            const requests = activeProviders.map(config => () => {
              providerManager.recordRequest(config.instance.constructor.name);
              return config.instance.search({ query, limit: resultsPerProvider }).catch((error: any) => {
                providerManager.handleError(config.instance.constructor.name, error);
                return [];
              });
            });

            const results = await executeProviderRequests(requests, 1500);
            const providerResults = activeProviders.map((config, index) => ({
              provider: config.instance.constructor.name,
              articles: results[index] || []
            }));

            const distributed = fairDistribution(providerResults);
            const searchResults = deduplicateArticles(distributed);

            console.log(`✅ Found ${searchResults.length} search results`);

            set(state => ({
              search: {
                ...state.search,
                results: searchResults,
                recentQueries: [query, ...state.search.recentQueries.filter(q => q !== query)].slice(0, 10),
                loading: false,
              },
            }));

          } catch (error) {
            console.error('❌ Search error:', error);
            
            try {
              const demoProvider = PROVIDER_CONFIGS.find(c => c.instance instanceof DemoProvider);
              if (demoProvider) {
                const demoResults = await demoProvider.instance.search({ query, limit: 15 });
                set(state => ({
                  search: {
                    ...state.search,
                    results: demoResults,
                    loading: false,
                    error: 'Using demo results due to API issues',
                  },
                }));
              }
            } catch {
              set(state => ({
                search: {
                  ...state.search,
                  loading: false,
                  error: 'Search failed',
                },
              }));
            }
          }
        },

        loadTopStories: async () => {
          set(state => ({ articles: { ...state.articles, loading: true, error: undefined } }));

          try {
            const activeProviders = providerManager.getActiveProviders('topStories');
            
            if (activeProviders.length === 0) {
              throw new Error('No providers available for top stories');
            }

            console.log('📰 Loading top stories from:', activeProviders.map(p => p.instance.constructor.name).join(', '));

            const MAX_ARTICLES = 20;
            const perProviderLimit = Math.ceil(MAX_ARTICLES / activeProviders.length);

            const requests = activeProviders.map(config => () => {
              providerManager.recordRequest(config.instance.constructor.name);
              return config.instance.getTopStories(perProviderLimit).catch((error: any) => {
                providerManager.handleError(config.instance.constructor.name, error);
                return [];
              });
            });

            const results = await executeProviderRequests(requests);
            const providerResults = activeProviders.map((config, index) => ({
              provider: config.instance.constructor.name,
              articles: results[index] || []
            }));

            const distributed = fairDistribution(providerResults);
            const articles = deduplicateArticles(distributed).slice(0, MAX_ARTICLES);

            if (articles.length > 0) {
              const sourceCounts = new Map();
              articles.forEach(article => {
                const count = sourceCounts.get(article.source.name) || 0;
                sourceCounts.set(article.source.name, count + 1);
              });
              
              console.log(`✅ Loaded ${articles.length} top stories:`, Object.fromEntries(sourceCounts));

              set(state => ({
                articles: {
                  ...state.articles,
                  sections: { ...state.articles.sections, top_stories: articles },
                  loading: false,
                },
              }));
              return;
            }

            throw new Error('No articles loaded from any provider');

          } catch (error) {
            console.error('❌ Error loading top stories:', error);
            
            // Fallback to demo provider
            try {
              const demoProvider = PROVIDER_CONFIGS.find(c => c.instance instanceof DemoProvider);
              if (demoProvider) {
                const demoArticles = await demoProvider.instance.getTopStories();
                set(state => ({
                  articles: {
                    ...state.articles,
                    sections: { ...state.articles.sections, top_stories: demoArticles },
                    loading: false,
                    error: 'Using demo data due to API issues',
                  },
                }));
              }
            } catch {
              set(state => ({
                articles: {
                  ...state.articles,
                  loading: false,
                  error: 'Failed to load top stories',
                },
              }));
            }
          }
        },

        loadSportsNews: async () => {
          set(state => ({ articles: { ...state.articles, loading: true, error: undefined } }));

          try {
            const activeProviders = providerManager.getActiveProviders('sports');
            
            if (activeProviders.length === 0) {
              throw new Error('No providers available for sports');
            }

            console.log('🏈 Loading sports news from:', activeProviders.map(p => p.instance.constructor.name).join(', '));

            const MAX_ARTICLES = 25;
            const perProviderLimit = Math.ceil(MAX_ARTICLES / activeProviders.length);

            const requests = activeProviders.map(config => () => {
              providerManager.recordRequest(config.instance.constructor.name);
              return config.instance.getArticlesByTopic('sports', perProviderLimit).catch((error: any) => {
                providerManager.handleError(config.instance.constructor.name, error);
                return [];
              });
            });

            const results = await executeProviderRequests(requests);
            const providerResults = activeProviders.map((config, index) => ({
              provider: config.instance.constructor.name,
              articles: results[index] || []
            }));

            const distributed = fairDistribution(providerResults);
            const articles = deduplicateArticles(distributed).slice(0, MAX_ARTICLES);

            if (articles.length > 0) {
              console.log(`✅ Loaded ${articles.length} sports articles`);

              set(state => ({
                articles: {
                  ...state.articles,
                  sections: { ...state.articles.sections, sports: articles },
                  loading: false,
                },
              }));
              return;
            }

            throw new Error('No sports articles loaded');

          } catch (error) {
            console.error('❌ Error loading sports:', error);
            
            // Fallback to demo provider
            try {
              const demoProvider = PROVIDER_CONFIGS.find(c => c.instance instanceof DemoProvider);
              if (demoProvider) {
                const demoArticles = await demoProvider.instance.getArticlesByTopic('sports');
                set(state => ({
                  articles: {
                    ...state.articles,
                    sections: { ...state.articles.sections, sports: demoArticles },
                    loading: false,
                    error: 'Using demo data due to API issues',
                  },
                }));
              }
            } catch {
              set(state => ({
                articles: {
                  ...state.articles,
                  loading: false,
                  error: 'Failed to load sports news',
                },
              }));
            }
          }
        },

        loadSection: async (sectionType: string) => {
          set(state => ({ articles: { ...state.articles, loading: true, error: undefined } }));

          try {
            const feature = sectionType === 'local' ? 'localNews' : 'topStories';
            const activeProviders = providerManager.getActiveProviders(feature);
            
            if (activeProviders.length === 0) {
              throw new Error(`No providers available for section: ${sectionType}`);
            }

            console.log(`📰 Loading section "${sectionType}" from:`, activeProviders.map(p => p.instance.constructor.name).join(', '));

            const MAX_ARTICLES = 20;
            const perProviderLimit = Math.ceil(MAX_ARTICLES / activeProviders.length);
            let requests: Array<() => Promise<Article[]>> = [];

            if (sectionType === 'for_you') {
              const { followedTopics } = get().user.preferences;
              
              if (followedTopics.length > 0) {
                requests = activeProviders.map(config => async () => {
                  providerManager.recordRequest(config.instance.constructor.name);
                  
                  try {
                    const topicPromises = followedTopics.slice(0, 3).map(topic =>
                      config.instance.getArticlesByTopic(topic, Math.ceil(perProviderLimit / 3))
                        .catch(() => [])
                    );
                    const topicResults = await Promise.all(topicPromises);
                    return topicResults.flat().slice(0, perProviderLimit);
                  } catch (error) {
                    providerManager.handleError(config.instance.constructor.name, error);
                    return [];
                  }
                });
              } else {
                requests = activeProviders.map(config => () => {
                  providerManager.recordRequest(config.instance.constructor.name);
                  return config.instance.getTopStories(perProviderLimit).catch((error: any) => {
                    providerManager.handleError(config.instance.constructor.name, error);
                    return [];
                  });
                });
              }

            } else if (sectionType === 'local') {
              requests = activeProviders.map(config => async () => {
                providerManager.recordRequest(config.instance.constructor.name);
                
                try {
                  if (config.features.localNews && typeof config.instance.getLocalNews === 'function') {
                    const articles = await config.instance.getLocalNews('us');
                    return articles.slice(0, perProviderLimit);
                  } else {
                    return await config.instance.getTopStories(perProviderLimit);
                  }
                } catch (error) {
                  providerManager.handleError(config.instance.constructor.name, error);
                  return [];
                }
              });

            } else {
              requests = activeProviders.map(config => () => {
                providerManager.recordRequest(config.instance.constructor.name);
                return config.instance.getArticlesByTopic(sectionType, perProviderLimit).catch((error: any) => {
                  providerManager.handleError(config.instance.constructor.name, error);
                  return [];
                });
              });
            }

            const results = await executeProviderRequests(requests);
            const providerResults = activeProviders.map((config, index) => ({
              provider: config.instance.constructor.name,
              articles: results[index] || []
            }));

            const distributed = fairDistribution(providerResults);
            const articles = deduplicateArticles(distributed).slice(0, MAX_ARTICLES);

            if (articles.length > 0) {
              const sourceCounts = new Map();
              articles.forEach(article => {
                const count = sourceCounts.get(article.source.name) || 0;
                sourceCounts.set(article.source.name, count + 1);
              });
              
              console.log(`✅ Loaded ${articles.length} articles for ${sectionType}:`, Object.fromEntries(sourceCounts));

              set(state => ({
                articles: {
                  ...state.articles,
                  sections: { ...state.articles.sections, [sectionType]: articles },
                  loading: false,
                },
              }));
              return;
            }

            throw new Error(`No articles loaded for ${sectionType}`);

          } catch (error) {
            console.error(`❌ Error loading section ${sectionType}:`, error);
            
            // Fallback to demo provider
            try {
              const demoProvider = PROVIDER_CONFIGS.find(c => c.instance instanceof DemoProvider);
              if (demoProvider) {
                const demoArticles = sectionType === 'for_you' || sectionType === 'local'
                  ? await demoProvider.instance.getTopStories()
                  : await demoProvider.instance.getArticlesByTopic(sectionType);
                
                set(state => ({
                  articles: {
                    ...state.articles,
                    sections: { ...state.articles.sections, [sectionType]: demoArticles },
                    loading: false,
                    error: 'Using demo data due to API issues',
                  },
                }));
              }
            } catch {
              set(state => ({
                articles: {
                  ...state.articles,
                  loading: false,
                  error: `Failed to load ${sectionType}`,
                },
              }));
            }
          }
        },

        performSearch: async (query: string) => {
          return get().searchNews(query);
        },

        loadTopics: async () => {
          set(state => ({ topics: { ...state.topics, loading: true } }));
          
          try {
            const activeProviders = providerManager.getActiveProviders('topics');
            console.log('📋 Loading topics from:', activeProviders.map(p => p.instance.constructor.name).join(', '));

            const requests = activeProviders.map(config => () => {
              providerManager.recordRequest(config.instance.constructor.name);
              return config.instance.getTopics().catch(() => []);
            });

            const results = await executeProviderRequests(requests, 1000);
            const allTopics = results.flat();
            
            const topicMap = new Map<string, Topic>();
            allTopics.forEach((topic, index) => {
              const uniqueId = topicMap.has(topic.id) ? `${topic.id}_${index}` : topic.id;
              topicMap.set(uniqueId, {
                ...topic, id: uniqueId,
                name: ''
              });
            });

            const available = Array.from(topicMap.values());
            const followed = available.filter((t: Topic) =>
              get().user.preferences.followedTopics.includes(t.id.split('_')[0])
            );

            set(state => ({ topics: { ...state.topics, available, followed, loading: false } }));
          } catch (error) {
            console.error('❌ Topics error:', error);
            set(state => ({ topics: { ...state.topics, loading: false } }));
          }
        },

        loadPublishers: async () => {
          set(state => ({ publishers: { ...state.publishers, loading: true } }));
          
          try {
            const activeProviders = providerManager.getActiveProviders('publishers');
            console.log('🏢 Loading publishers from:', activeProviders.map(p => p.instance.constructor.name).join(', '));

            const requests = activeProviders.map(config => () => {
              providerManager.recordRequest(config.instance.constructor.name);
              return config.instance.getPublishers().catch(() => []);
            });

            const results = await executeProviderRequests(requests, 1000);
            const publisherMap = new Map<string, Publisher>();
            
            results.flat().forEach(publisher => {
              return publisherMap.set(publisher.id, publisher);
            });

            const available = Array.from(publisherMap.values());
            const followed = available.filter((p: Publisher) =>
              get().user.preferences.followedPublishers.includes(p.id)
            );

            set(state => ({ publishers: { ...state.publishers, available, followed, loading: false } }));
          } catch (error) {
            console.error('❌ Publishers error:', error);
            set(state => ({ publishers: { ...state.publishers, loading: false } }));
          }
        },

        // Clear search results (for Apple News-style behavior)
        clearSearch: () => {
          set(state => ({
            search: {
              ...state.search,
              results: [],
            },
          }));
        },

        // =====================================================
        // ARTICLE MANAGEMENT (unchanged)
        // =====================================================

        saveArticle: (article: Article) => {
          set(state => ({
            articles: {
              ...state.articles,
              saved: state.articles.saved.find(a => a.id === article.id)
                ? state.articles.saved
                : [...state.articles.saved, { ...article, saved: true }],
            },
          }));
        },

        unsaveArticle: (articleId: string) => {
          set(state => ({
            articles: {
              ...state.articles,
              saved: state.articles.saved.filter(a => a.id !== articleId),
            },
          }));
        },

        downloadArticle: (article: Article) => {
          set(state => ({
            articles: {
              ...state.articles,
              downloaded: state.articles.downloaded.find(a => a.id === article.id)
                ? state.articles.downloaded
                : [...state.articles.downloaded, { ...article, downloaded: true }],
            },
          }));
        },

        removeDownload: (articleId: string) => {
          set(state => ({
            articles: {
              ...state.articles,
              downloaded: state.articles.downloaded.filter(a => a.id !== articleId),
            },
          }));
        },

        addToHistory: (article: Article) => {
          set(state => ({
            articles: {
              ...state.articles,
              history: [article, ...state.articles.history.filter(a => a.id !== article.id)].slice(0, 100),
            },
          }));
        },

        followTopic: (topicId: string) => {
          const cleanId = topicId.split('_')[0];
          set(state => ({
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                followedTopics: state.user.preferences.followedTopics.includes(cleanId)
                  ? state.user.preferences.followedTopics
                  : [...state.user.preferences.followedTopics, cleanId],
              },
            },
          }));
        },

        unfollowTopic: (topicId: string) => {
          const cleanId = topicId.split('_')[0];
          set(state => ({
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                followedTopics: state.user.preferences.followedTopics.filter(id => id !== cleanId),
              },
            },
          }));
        },

        followPublisher: (publisherId: string) => {
          set(state => ({
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                followedPublishers: state.user.preferences.followedPublishers.includes(publisherId)
                  ? state.user.preferences.followedPublishers
                  : [...state.user.preferences.followedPublishers, publisherId],
              },
            },
          }));
        },

        unfollowPublisher: (publisherId: string) => {
          set(state => ({
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                followedPublishers: state.user.preferences.followedPublishers.filter(id => id !== publisherId),
              },
            },
          }));
        },

        updatePreferences: preferences => {
          set(state => ({
            user: { ...state.user, preferences: { ...state.user.preferences, ...preferences } },
          }));
        },

        clearError: () => {
          set(state => ({ 
            articles: { ...state.articles, error: undefined },
            search: { ...state.search, error: undefined },
          }));
        },
      };
    },
    {
      name: 'glint-news-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        articles: {
          saved: state.articles.saved || [],
          downloaded: state.articles.downloaded || [],
          history: state.articles.history || [],
        },
        search: { recentQueries: state.search.recentQueries || [] },
      }),
    }
  )
);