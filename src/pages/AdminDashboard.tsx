
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/utils/dbUtils';
import { useToast } from "@/hooks/use-toast";
import { CategoriesSection } from '@/components/admin/CategoriesSection';
import { ArticlesSection } from '@/components/admin/ArticlesSection';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const AdminDashboard = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingSource, setRefreshingSource] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [articlesResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('articles')
          .select('*, categories(name, slug)')
          .order('published_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (articlesResponse.error) throw articlesResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      console.log('Fetched articles:', articlesResponse.data.length);
      const mappedArticles = articlesResponse.data.map(article => ({
        ...article,
        url: article.url ?? null // Use nullish coalescing to ensure null if url doesn't exist
      }));

      setArticles(mappedArticles);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading dashboard data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.filter(article => article.id !== id));
      toast({
        title: "Article deleted successfully",
        description: "The article has been removed from the database",
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error deleting article",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const refreshSource = async (categorySlug: string) => {
    setRefreshingSource(categorySlug);
    try {
      console.log('Refreshing category:', categorySlug);
      const { error } = await supabase.functions.invoke('update-feeds', {
        body: { category: categorySlug }
      });

      if (error) throw error;

      toast({
        title: "Refresh initiated",
        description: `Started refreshing feeds for ${categorySlug}`,
      });

      // Immediately fetch new data after the refresh
      await fetchData();

    } catch (error) {
      console.error('Error refreshing feeds:', error);
      toast({
        title: "Error refreshing feeds",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setRefreshingSource(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="space-y-8">
        <CategoriesSection
          categories={categories}
          onRefreshSource={refreshSource}
          refreshingSource={refreshingSource}
        />
        <ArticlesSection
          articles={articles}
          onDeleteArticle={deleteArticle}
        />
      </div>
    </div>
  );
};
