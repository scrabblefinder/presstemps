
export interface RSSArticle {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  source: string;
  date: string;
  author: string;
  url: string;
  isAd?: boolean;
}

export interface Advertisement {
  id: number;
  title: string;
  url: string | null;
  excerpt: string | null;
  source_text: string;
  is_active: boolean | null;
  created_at: string | null;
  image_url: string;
  type: 'image' | 'text';
}
