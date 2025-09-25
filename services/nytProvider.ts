import { NewsProvider } from './newsProvider';
import { Article, Topic, Publisher, SearchFilters } from '../types/news';

export class NYTProvider extends NewsProvider {
  name = 'New York Times';
  baseUrl = 'https://api.nytimes.com';
  private apiKey: string;

  constructor(apiKey: string = '') {
    super();
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '' && this.apiKey !== 'demo-key';
  }

  private async request(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('NYT API key not available or invalid');
    }

    // Ensure endpoint starts with /svc/ for NYT API
    const normalizedEndpoint = endpoint.startsWith('/svc/') ? endpoint : `/svc${endpoint}`;
    const url = new URL(normalizedEndpoint, this.baseUrl);
    url.searchParams.append('api-key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    console.log(`🔗 NYT API Request: ${url.toString().replace(this.apiKey, '[API_KEY]')}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NewsApp/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('NYT API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url.toString().replace(this.apiKey, '[API_KEY]')
        });
        
        // Provide more specific error messages
        if (response.status === 401) {
          throw new Error('NYT API authentication failed - check your API key');
        } else if (response.status === 403) {
          throw new Error('NYT API access forbidden - check your API key permissions');
        } else if (response.status === 404) {
          throw new Error(`NYT API endpoint not found: ${normalizedEndpoint}`);
        } else if (response.status === 429) {
          throw new Error('NYT API rate limit exceeded - try again later');
        } else if (response.status >= 500) {
          throw new Error('NYT API server error - try again later');
        }
        
        throw new Error(`NYT API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // NYT API sometimes returns errors in the response body
      if (data.fault) {
        console.error('NYT API Fault:', data.fault);
        throw new Error(`NYT API fault: ${data.fault.faultstring}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - check your internet connection');
      }
      throw error;
    }
  }

  private transformTopStoryArticle(article: any): Article {
    return {
      id: `nyt-${article.url?.split('/').pop() || article.uri || Date.now()}`,
      title: article.title || 'Untitled',
      excerpt: article.abstract || article.des_facet?.[0] || '',
      url: article.url || article.short_url,
      source: {
        id: 'nytimes',
        name: 'The New York Times',
      },
      author: article.byline?.replace('By ', '') || 'NYT Staff',
      publishedAt: article.published_date || article.created_date,
      section: article.section || 'News',
      topics: [article.section || 'news'],
      image: this.extractBestImage(article.multimedia),
      readingTimeMin: Math.max(1, Math.ceil((article.abstract?.length || 200) / 200)),
    };
  }

  private transformSearchArticle(article: any): Article {
    return {
      id: `nyt-search-${article._id}`,
      title: article.headline?.main || article.headline?.print_headline || 'Untitled',
      excerpt: article.abstract || article.lead_paragraph || article.snippet,
      url: article.web_url,
      source: {
        id: 'nytimes',
        name: 'The New York Times',
      },
      author: article.byline?.original?.replace('By ', '') || 'NYT Staff',
      publishedAt: article.pub_date,
      section: article.section_name || article.news_desk,
      topics: article.section_name ? [article.section_name.toLowerCase()] : ['news'],
      image: this.extractBestImageFromSearch(article.multimedia),
      readingTimeMin: Math.max(1, Math.ceil((article.abstract?.length || article.lead_paragraph?.length || 300) / 200)),
    };
  }

  private extractBestImage(multimedia: any[]): Article['image'] | undefined {
    if (!multimedia || !Array.isArray(multimedia) || multimedia.length === 0) {
      return undefined;
    }

    // Look for the best quality image
    const preferredFormats = ['superJumbo', 'jumbo', 'articleLarge', 'Normal'];
    
    for (const format of preferredFormats) {
      const image = multimedia.find(m => m.format === format);
      if (image) {
        return {
          url: image.url,
          width: image.width || 800,
          height: image.height || 600,
        };
      }
    }

    // Fallback to first available image
    const firstImage = multimedia[0];
    return firstImage ? {
      url: firstImage.url,
      width: firstImage.width || 800,
      height: firstImage.height || 600,
    } : undefined;
  }

  private extractBestImageFromSearch(multimedia: any[]): Article['image'] | undefined {
    if (!multimedia || !Array.isArray(multimedia) || multimedia.length === 0) {
      return undefined;
    }

    // For search results, images need the NYT base URL
    const firstImage = multimedia[0];
    if (firstImage && firstImage.url) {
      return {
        url: firstImage.url.startsWith('http') ? firstImage.url : `https://static01.nyt.com/${firstImage.url}`,
        width: firstImage.width || 800,
        height: firstImage.height || 600,
      };
    }

    return undefined;
  }

  async getTopStories(limit = 20): Promise<Article[]> {
    try {
      const data = await this.request('/topstories/v2/home.json');
      
      if (!data.results || !Array.isArray(data.results)) {
        console.warn('NYT API returned unexpected data structure');
        return [];
      }
      
      return data.results
        .slice(0, limit)
        .map((article: any) => this.transformTopStoryArticle(article))
        .filter((article: Article) => article.title && article.url);
    } catch (error) {
      console.error('Error fetching NYT top stories:', error);
      throw error;
    }
  }

  async getArticlesByTopic(topicId: string, limit = 20): Promise<Article[]> {
    // Map common topic IDs to NYT sections
    const sectionMap: Record<string, string> = {
      'technology': 'technology',
      'world': 'world',
      'business': 'business',
      'science': 'science',
      'health': 'health',
      'sports': 'sports',
      'arts': 'arts',
      'politics': 'politics',
      'opinion': 'opinion',
      'food': 'food',
      'travel': 'travel',
      'us': 'us',
      'national': 'us',
      'international': 'world'
    };

    const section = sectionMap[topicId.toLowerCase()];
    
    if (section) {
      try {
        // Try to get articles from specific section first
        const data = await this.request(`/topstories/v2/${section}.json`);
        
        if (data.results && Array.isArray(data.results)) {
          return data.results
            .slice(0, limit)
            .map((article: any) => this.transformTopStoryArticle(article))
            .filter((article: Article) => article.title && article.url);
        }
      } catch (error) {
        console.warn(`NYT section ${section} not available:`, (error instanceof Error ? error.message : String(error)));
      }
    }
    
    // Fallback to search
    console.log(`🔄 Falling back to search for topic: ${topicId}`);
    try {
      return await this.search({ query: topicId, limit });
    } catch (searchError) {
      console.error('NYT search fallback also failed:', searchError);
      throw new Error(`Unable to fetch articles for topic: ${topicId}`);
    }
  }

  async search(filters: SearchFilters): Promise<Article[]> {
    const params: Record<string, string> = {
      sort: 'newest',
      page: '0'
    };

    if (filters.query) {
      params.q = filters.query;
    }

    if (filters.dateRange) {
      // NYT expects dates in YYYYMMDD format
      params.begin_date = filters.dateRange.from.replace(/[-:T]/g, '').slice(0, 8);
      params.end_date = filters.dateRange.to.replace(/[-:T]/g, '').slice(0, 8);
    }

    try {
      const data = await this.request('/search/v2/articlesearch.json', params);
      
      if (!data.response?.docs) {
        console.warn('NYT search returned unexpected data structure');
        return [];
      }
      
      const limit = filters.limit || 20;
      return data.response.docs
        .slice(0, limit)
        .map((article: any) => this.transformSearchArticle(article))
        .filter((article: Article) => article.title && article.url);
    } catch (error) {
      console.error('NYT search error:', error);
      throw error;
    }
  }

  async getLocalNews(region: string): Promise<Article[]> {
    // For US local news, we'll get US section articles
    if (region.toLowerCase() === 'us' || region.toLowerCase() === 'usa') {
      try {
        const data = await this.request('/topstories/v2/us.json');
        
        if (data.results && Array.isArray(data.results)) {
          return data.results
            .slice(0, 20)
            .map((article: any) => this.transformTopStoryArticle(article))
            .filter((article: Article) => article.title && article.url);
        }
      } catch (error) {
        console.warn('NYT US section not available, falling back to top stories');
        return this.getTopStories(20);
      }
    }
    
    // For other regions, search for region-specific news
    try {
      return await this.search({ query: `${region} local news`, limit: 15 });
    } catch (error) {
      console.warn('NYT local news search failed, falling back to top stories');
      return this.getTopStories(15);
    }
  }

  async getArticlesByPublisher(publisherId: string, limit = 20): Promise<Article[]> {
    // NYT API only returns NYT articles, so we'll return top stories
    return this.getTopStories(limit);
  }

  async getTopics(): Promise<Topic[]> {
    // NYT sections - these are the available sections for top stories
    return [
      { id: 'home', name: 'Home' },
      { id: 'world', name: 'World' },
      { id: 'us', name: 'U.S.' },
      { id: 'politics', name: 'Politics' },
      { id: 'business', name: 'Business' },
      { id: 'technology', name: 'Technology' },
      { id: 'science', name: 'Science' },
      { id: 'health', name: 'Health' },
      { id: 'sports', name: 'Sports' },
      { id: 'arts', name: 'Arts' },
      { id: 'books', name: 'Books' },
      { id: 'movies', name: 'Movies' },
      { id: 'theater', name: 'Theater' },
      { id: 'food', name: 'Food' },
      { id: 'travel', name: 'Travel' },
      { id: 'magazine', name: 'Magazine' },
      { id: 'realestate', name: 'Real Estate' },
      { id: 'fashion', name: 'Fashion' },
      { id: 'opinion', name: 'Opinion' },
    ];
  }

  async getPublishers(): Promise<Publisher[]> {
    // NYT API only provides NYT content
    return [
      {
        id: 'nytimes',
        name: 'The New York Times',
        description: 'All the News That\'s Fit to Print',
        homepage: 'https://nytimes.com',
      }
    ];
  }
}