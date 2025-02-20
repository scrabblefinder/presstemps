
import { supabase } from "@/integrations/supabase/client";

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
}

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

export const fetchArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data as Article[];
};

export const fetchArticleBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Article;
};
