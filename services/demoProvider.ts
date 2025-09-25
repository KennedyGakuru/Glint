// services/demoProvider.ts
import { NewsProvider } from './newsProvider';
import { Article, Topic, Publisher, SearchFilters } from '../types/news';

export class DemoProvider extends NewsProvider {
  name = 'Demo';
  baseUrl = '';

  isAvailable(): boolean {
    return true; // Demo is always available
  }

  private generateDemoArticles(): Article[] {
    const now = new Date();
    const sources = [
      { id: 'tech-news', name: 'Tech News' },
      { id: 'world-news', name: 'World News' },
      { id: 'business-news', name: 'Business News' },
      { id: 'health-news', name: 'Health News' },
      { id: 'sports-news', name: 'Sports News' },
    ];

    const topics = ['technology', 'world', 'business', 'science', 'health', 'sports', 'politics', 'entertainment'];
    const images = [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
      'https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg',
      'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
      'https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg',
    ];

    return Array.from({ length: 20 }, (_, i) => ({
      id: `demo-${i + 1}`,
      title: `Breaking News Article ${i + 1}: Important Development`,
      excerpt: `This is a sample news excerpt for article ${i + 1}. It provides a brief summary of the important news story that you would normally read from a real news source.`,
      url: `https://example.com/news-article-${i + 1}`,
      source: sources[i % sources.length],
      author: ['Alex Chen', 'Sarah Johnson', 'Dr. Maria Rodriguez', 'James Wilson', 'Emma Thompson'][i % 5],
      publishedAt: new Date(now.getTime() - (i * 3600000)).toISOString(),
      topics: [topics[i % topics.length]],
      image: {
        url: images[i % images.length],
        width: 800,
        height: 600,
      },
      readingTimeMin: Math.ceil(Math.random() * 8) + 2,
    }));
  }

  private demoArticles = this.generateDemoArticles();

  async getTopStories(limit = 20): Promise<Article[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return [...this.demoArticles].slice(0, limit);
  }

  async getArticlesByTopic(topicId: string, limit = 20): Promise<Article[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const filtered = this.demoArticles.filter(article => 
      article.topics.includes(topicId.toLowerCase())
    );
    return filtered.slice(0, limit);
  }

  async getArticlesByPublisher(publisherId: string, limit = 20): Promise<Article[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const filtered = this.demoArticles.filter(article => 
      article.source.id === publisherId
    );
    return filtered.slice(0, limit);
  }

  async search(filters: SearchFilters): Promise<Article[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    let results = [...this.demoArticles];
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    if (filters.sources?.length) {
      results = results.filter(article => 
        filters.sources!.includes(article.source.id)
      );
    }
    
    return results.slice(0, filters.limit || 50);
  }

  async getTopics(): Promise<Topic[]> {
    return [
      { id: 'technology', name: 'Technology' },
      { id: 'world', name: 'World' },
      { id: 'business', name: 'Business' },
      { id: 'science', name: 'Science' },
      { id: 'health', name: 'Health' },
      { id: 'sports', name: 'Sports' },
      { id: 'politics', name: 'Politics' },
      { id: 'entertainment', name: 'Entertainment' },
      { id: 'climate', name: 'Climate' },
      { id: 'medicine', name: 'Medicine' },
    ];
  }

  async getPublishers(): Promise<Publisher[]> {
    return [
      { 
        id: 'tech-news', 
        name: 'Tech News',
        description: 'Latest technology news and insights',
        homepage: 'https://technews.example.com'
      },
      { 
        id: 'world-news', 
        name: 'World News',
        description: 'Global news and current events',
        homepage: 'https://worldnews.example.com'
      },
      { 
        id: 'business-news', 
        name: 'Business News',
        description: 'Business and financial news',
        homepage: 'https://businessnews.example.com'
      },
      { 
        id: 'health-news', 
        name: 'Health News',
        description: 'Health and medical news',
        homepage: 'https://healthnews.example.com'
      },
      { 
        id: 'sports-news', 
        name: 'Sports News',
        description: 'Sports coverage and analysis',
        homepage: 'https://sportsnews.example.com'
      },
    ];
  }

  async getLocalNews(region = 'us'): Promise<Article[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return a subset that might be relevant to local news
    return this.demoArticles
      .filter(article => article.topics.includes('world') || article.topics.includes('politics'))
      .slice(0, 10);
  }
}