
import { supabase } from "@/integrations/supabase/client";
import { RSSArticle } from "./types/rssTypes";
import { decodeHTMLEntities } from "./helpers/textUtils";

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  original_image_url: string | null;
  category_id: number;
  source: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  url: string | null;
  categories?: {
    name: string;
    slug: string;
  };
}

const mapArticleToRSSArticle = (article: Article): RSSArticle => {
  // Create a fallback URL using the source and title if no URL is present
  const fallbackUrl = article.source && article.title 
    ? `https://${article.source}.com/article/${article.slug}`
    : '';
    
  console.log('Mapping article:', {
    title: article.title,
    originalUrl: article.url,
    fallbackUrl: fallbackUrl,
    categoryId: article.category_id
  });

  return {
    title: decodeHTMLEntities(article.title),
    excerpt: decodeHTMLEntities(article.excerpt || ''),
    image: article.image_url,
    category: article.category_id.toString(),
    source: article.source || 'unknown',
    date: article.published_at || article.created_at,
    author: article.author || 'unknown',
    url: article.url || fallbackUrl,
  };
};

export const saveArticle = async (article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('articles')
    .upsert(
      { ...article },
      { onConflict: 'slug', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchArticles = async (category?: string): Promise<RSSArticle[]> => {
  console.log('Fetching articles for category:', category);

  let query = supabase
    .from('articles')
    .select(`
      *,
      categories:category_id (
        name,
        slug
      )
    `)
    .order('published_at', { ascending: false });

  if (category && category !== 'all') {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();

    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
  
  console.log('Articles from database:', data);
  const mappedArticles = (data as Article[]).map(mapArticleToRSSArticle);
  console.log('Mapped articles:', mappedArticles);
  
  return mappedArticles;
};

export const fetchArticleBySlug = async (slug: string): Promise<RSSArticle> => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      categories:category_id (
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return mapArticleToRSSArticle(data as Article);
};

export const getCategoryId = async (slug: string): Promise<number> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data.id;
};
