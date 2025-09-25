import { NewsProvider } from './newsProvider';
import { Article, Topic, Publisher, SearchFilters } from '../types/news';

export class MediastackProvider extends NewsProvider {
  getArticlesByPublisher(publisherId: string, limit?: number): Promise<Article[]> {
    throw new Error('Method not implemented.');
  }
  getLocalNews(region: string): Promise<Article[]> {
    throw new Error('Method not implemented.');
  }
  name = 'Mediastack';
  baseUrl = 'http://api.mediastack.com/v1';
  private apiKey: string;

  constructor(apiKey: string = '') {
    super();
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }

  private async request(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Mediastack API key not available or invalid');
    }

    const url = new URL(`${endpoint}`, this.baseUrl);
    url.searchParams.append('access_key', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    console.log(`🔗 Mediastack API Request: ${url.toString().replace(this.apiKey, '[API_KEY]')}`);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Mediastack error: ${res.status} ${res.statusText}`);
    return res.json();
  }

private transformArticle(article: any): Article {
  return {
    id: `mediastack-${article.url}`,
    title: article.title,
    excerpt: article.description || '',
    url: article.url,
    source: {
      id: article.source || 'mediastack',
      name: article.source || 'Mediastack',
      logoUrl: undefined
    },
    author: article.author || 'Unknown',
    publishedAt: article.published_at,
    section: article.category || 'General',
    topics: [article.category || 'general'],
    image: article.image ? { url: article.image, width: 800, height: 600 } : undefined,
    readingTimeMin: Math.max(1, Math.ceil((article.description?.length || 200) / 200)),
    content: undefined,
    description: undefined
  };
}

  async getTopStories(limit = 20): Promise<Article[]> {
    const data = await this.request('/news', { countries: 'us', languages: 'en', limit: String(limit) });
    return (data.data || []).map((a: any) => this.transformArticle(a));
  }

  async getArticlesByTopic(topicId: string, limit = 20): Promise<Article[]> {
    const data = await this.request('/news', { categories: topicId, languages: 'en', limit: String(limit) });
    return (data.data || []).map((a: any) => this.transformArticle(a));
  }

  async search(filters: SearchFilters): Promise<Article[]> {
    const data = await this.request('/news', {
      keywords: filters.query || '',
      limit: String(filters.limit || 20),
      languages: 'en',
    });
    return (data.data || []).map((a: any) => this.transformArticle(a));
  }

  async getTopics(): Promise<Topic[]> {
    return [
      { id: 'technology', name: 'Technology' },
      { id: 'business', name: 'Business' },
      { id: 'sports', name: 'Sports' },
      { id: 'health', name: 'Health' },
      { id: 'science', name: 'Science' },
      { id: 'entertainment', name: 'Entertainment' },
    ];
  }

  async getPublishers(): Promise<Publisher[]> {
    return [{ id: 'mediastack', name: 'Mediastack', homepage: 'https://mediastack.com' }];
  }
}
