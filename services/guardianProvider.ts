import { NewsProvider } from './newsProvider';
import { Article, Topic, Publisher, SearchFilters } from '../types/news';

export class GuardianProvider extends NewsProvider {
  name = 'Guardian';
  baseUrl = 'https://content.guardianapis.com';
  private apiKey: string;

  constructor(apiKey: string = '') {
    super();
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '' && this.apiKey !== 'test';
  }

  private async request(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Guardian API key not available or invalid');
    }

    const url = new URL(endpoint, this.baseUrl);
    url.searchParams.append('api-key', this.apiKey);
    url.searchParams.append('show-fields', 'thumbnail,trailText,body,wordcount');
    url.searchParams.append('show-tags', 'keyword');
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    console.log(`🔗 Guardian API Request: ${url.toString().replace(this.apiKey, '[API_KEY]')}`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NewsApp/1.0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Guardian API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          throw new Error('Guardian API authentication failed - check your API key');
        } else if (response.status === 403) {
          throw new Error('Guardian API access forbidden - check your API key permissions');
        } else if (response.status >= 500) {
          throw new Error('Guardian API server error - try again later');
        }
        
        throw new Error(`Guardian API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.response?.status === 'error') {
        throw new Error(`Guardian API error: ${data.response.message}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - check your internet connection');
      }
      throw error;
    }
  }

  private transformArticle(article: any): Article {
    return {
      id: `guardian-${article.id}`,
      title: article.webTitle,
      excerpt: article.fields?.trailText || article.webTitle,
      body: article.fields?.body,
      url: article.webUrl,
      source: {
        id: 'the-guardian',
        name: 'The Guardian',
      },
      publishedAt: article.webPublicationDate,
      section: article.sectionName,
      topics: [article.sectionName?.toLowerCase() || 'news'],
      image: article.fields?.thumbnail ? {
        url: article.fields.thumbnail,
        width: 800,
        height: 600,
      } : undefined,
      readingTimeMin: article.fields?.wordcount ? 
        Math.max(1, Math.ceil(parseInt(article.fields.wordcount) / 200)) : 
        Math.max(1, Math.ceil((article.fields?.body?.length || 1000) / 1000)),
    };
  }

  async getTopStories(limit = 20): Promise<Article[]> {
    try {
      const data = await this.request('/search', {
        'order-by': 'newest',
        'page-size': limit.toString(),
        'show-fields': 'thumbnail,trailText,wordcount'
      });
      
      if (!data.response?.results) {
        return [];
      }
      
      return data.response.results
        .map((article: any) => this.transformArticle(article))
        .filter((article: Article) => article.title && article.url);
    } catch (error) {
      console.error('Error fetching Guardian top stories:', error);
      throw error;
    }
  }

  async getArticlesByTopic(topicId: string, limit = 20): Promise<Article[]> {
    try {
      const data = await this.request('/search', {
        q: topicId,
        'order-by': 'newest',
        'page-size': limit.toString(),
      });
      
      if (!data.response?.results) {
        return [];
      }
      
      return data.response.results
        .map((article: any) => this.transformArticle(article))
        .filter((article: Article) => article.title && article.url);
    } catch (error) {
      console.error('Error fetching Guardian articles by topic:', error);
      throw error;
    }
  }

  async getArticlesByPublisher(): Promise<Article[]> {
    return this.getTopStories();
  }

  async search(filters: SearchFilters): Promise<Article[]> {
    const params: Record<string, string> = {
      'order-by': 'newest',
      'page-size': (filters.limit || 50).toString(),
    };

    if (filters.query) params.q = filters.query;
    if (filters.dateRange) {
      params['from-date'] = filters.dateRange.from.split('T')[0];
      params['to-date'] = filters.dateRange.to.split('T')[0];
    }

    try {
      const data = await this.request('/search', params);
      
      if (!data.response?.results) {
        return [];
      }
      
      return data.response.results
        .map((article: any) => this.transformArticle(article))
        .filter((article: Article) => article.title && article.url);
    } catch (error) {
      console.error('Guardian search error:', error);
      throw error;
    }
  }

  async getTopics(): Promise<Topic[]> {
    try {
      const data = await this.request('/sections');
      
      if (!data.response?.results) {
        return [];
      }
      
      return data.response.results.map((section: any) => ({
        id: section.id,
        name: section.webTitle,
      }));
    } catch (error) {
      console.error('Error fetching Guardian topics:', error);
      // Return default topics as fallback
      return [
        { id: 'world', name: 'World news' },
        { id: 'politics', name: 'Politics' },
        { id: 'business', name: 'Business' },
        { id: 'technology', name: 'Technology' },
        { id: 'science', name: 'Science' },
        { id: 'environment', name: 'Environment' },
        { id: 'sport', name: 'Sport' },
        { id: 'culture', name: 'Culture' },
      ];
    }
  }

  async getPublishers(): Promise<Publisher[]> {
    return [{
      id: 'the-guardian',
      name: 'The Guardian',
      homepage: 'https://theguardian.com',
      description: 'Independent journalism',
    }];
  }

  async getLocalNews(): Promise<Article[]> {
    return this.getTopStories();
  }
}