import { Article, Topic, Publisher } from './news';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  followedTopics: string[];
  followedPublishers: string[];
  notificationSettings: {
    breaking: boolean;
    digest: boolean;
    topics: string[];
  };
  downloadSettings: {
    wifiOnly: boolean;
    autoRemoveAfter: number; // days
    maxArticles: number;
  };
}

export interface AppState {
  user: {
    savedArticles: any;
    preferences: UserPreferences;
    isAuthenticated: boolean;
    userId?: string;
  };
  articles: {
    sections: Record<string, Article[]>;
    saved: Article[];
    downloaded: Article[];
    history: Article[];
    loading: boolean;
    error?: string;
  };
  topics: {
    available: Topic[];
    followed: Topic[];
    loading: boolean;
  };
  publishers: {
    available: Publisher[];
    followed: Publisher[];
    loading: boolean;
  };
  search: {
    results: Article[];
    recentQueries: string[];
    loading: boolean;
  };
}