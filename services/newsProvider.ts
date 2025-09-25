// services/newsProvider.ts
import { Article, Topic, Publisher, SearchFilters } from '../types/news';

export abstract class NewsProvider {
  abstract name: string;
  abstract baseUrl: string;
  
  abstract getTopStories(limit?: number): Promise<Article[]>;
  abstract getArticlesByTopic(topicId: string, limit?: number): Promise<Article[]>;
  abstract getArticlesByPublisher(publisherId: string, limit?: number): Promise<Article[]>;
  abstract search(filters: SearchFilters): Promise<Article[]>;
  abstract getTopics(): Promise<Topic[]>;
  abstract getPublishers(): Promise<Publisher[]>;
  abstract getLocalNews(region: string): Promise<Article[]>;
  
  // Optional isAvailable method for checking if provider is ready
  isAvailable?(): boolean;
}