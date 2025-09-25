import { NewsProvider } from './newsProvider';
import { Article, Topic, Publisher, SearchFilters } from '../types/news';

export class NewsDataProvider extends NewsProvider {
  getArticlesByPublisher(publisherId: string, limit?: number): Promise<Article[]> {
    throw new Error('Method not implemented.');
  }
  getLocalNews(region: string): Promise<Article[]> {
    throw new Error('Method not implemented.');
  }
  name = 'NewsData.io';
  baseUrl = 'https://newsdata.io/api/1';
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
      throw new Error('NewsData.io API key not available or invalid');
    }

    const url = new URL(`${endpoint}`, this.baseUrl);
    url.searchParams.append('apikey', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    console.log(`🔗 NewsData.io API Request: ${url.toString().replace(this.apiKey, '[API_KEY]')}`);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`NewsData.io error: ${res.status} ${res.statusText}`);
    return res.json();
  }

private transformArticle(article: any): Article {
  return {
    id: `newsdata-${article.article_id}`,
    title: article.title,
    excerpt: article.description || '',
    url: article.link,
    source: {
      id: 'newsdata',
      name: article.source_id || 'NewsData.io',
      logoUrl: undefined
    },
    author: article.creator?.join(', ') || 'Unknown',
    publishedAt: article.pubDate,
    section: article.category?.[0] || 'General',
    topics: article.category || ['general'],
    image: article.image_url ? { url: article.image_url, width: 800, height: 600 } : undefined,
    readingTimeMin: Math.max(1, Math.ceil((article.description?.length || 200) / 200)),
    content: undefined,
    description: undefined
  };
}

  async getTopStories(limit = 20): Promise<Article[]> {
    const data = await this.request('/news', { language: 'en', q: 'top' });
    return (data.results || [])
      .slice(0, limit)
      .map((a: any) => this.transformArticle(a));
  }

  async getArticlesByTopic(topicId: string, limit = 20): Promise<Article[]> {
    const data = await this.request('/news', { q: topicId, language: 'en' });
    return (data.results || [])
      .slice(0, limit)
      .map((a: any) => this.transformArticle(a));
  }

  async search(filters: SearchFilters): Promise<Article[]> {
    const data = await this.request('/news', {
      q: filters.query || '',
      language: 'en',
    });
    return (data.results || [])
      .slice(0, filters.limit || 20)
      .map((a: any) => this.transformArticle(a));
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
    return [{ id: 'newsdata', name: 'NewsData.io', homepage: 'https://newsdata.io' }];
  }
}
