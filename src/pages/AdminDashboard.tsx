
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/utils/dbUtils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const AdminDashboard = () => {
  const { isAdmin, isLoading: isCheckingAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingSource, setRefreshingSource] = useState<string | null>(null);

  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isCheckingAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
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

      // Map the response to include the url field required by Article type
      const mappedArticles = articlesResponse.data.map(article => ({
        ...article,
        url: null // Add the required url field
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
      const response = await fetch(
        'https://qykkqekfpogtgsemzset.supabase.co/functions/v1/update-feeds',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ category: categorySlug }),
        }
      );

      if (!response.ok) throw new Error('Failed to refresh feeds');

      toast({
        title: "Refresh initiated",
        description: `Started refreshing feeds for ${categorySlug}`,
      });

      // Wait a few seconds then refresh the article list
      setTimeout(() => {
        fetchData();
      }, 5000);

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

  if (isCheckingAdmin || (!isAdmin && isLoading)) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Navigate will handle redirect
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Categories and Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshSource(category.slug)}
                    disabled={refreshingSource === category.slug}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshingSource === category.slug ? "animate-spin" : ""}`} />
                    Refresh Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Articles</h2>
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg bg-white flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {article.categories?.name}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(article.published_at || article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteArticle(article.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
