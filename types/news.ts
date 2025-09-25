export type ArticleID = string;
export type TopicID = string;
export type PublisherID = string;

export interface Article {
  content: any;
  description: any;
  id: ArticleID;
  title: string;
  dek?: string;
  body?: string;
  excerpt?: string;
  url: string;
  source: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  section?: string;
  topics: string[];
  image?: {
    url: string;
    width: number;
    height: number;
    caption?: string;
  };
  video?: {
    url: string;
    duration?: number;
    poster?: string;
  };
  paywalled?: boolean;
  readingTimeMin?: number;
  saved?: boolean;
  downloaded?: boolean;
}

export interface Topic {
  id: TopicID;
  name: string;
  description?: string;
  followed?: boolean;
}

export interface Publisher {
  id: PublisherID;
  name: string;
  logoUrl?: string;
  homepage?: string;
  description?: string;
  followed?: boolean;
}

export interface NewsSection {
  id: string;
  title: string;
  articles: Article[];
  type: 'top_stories' | 'for_you' | 'local' | 'world' | 'tech' | 'business' | 'sport' | 'culture' | 'science' | 'lifestyle';
}

export interface SearchFilters {
  limit: number;
  query?: string;
  sources?: string[];
  topics?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  region?: string;
  paywalled?: boolean;
  minReadingTime?: number;
  maxReadingTime?: number;
}