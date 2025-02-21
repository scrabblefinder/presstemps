
import { useQuery } from '@tanstack/react-query';
import { fetchArticles } from '@/utils/dbUtils';
import { useToast } from "@/components/ui/use-toast";

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', category],
    queryFn: async () => {
      try {
        console.log('Fetching articles from database...');
        const articles = await fetchArticles(category);
        return articles;
      } catch (error) {
        console.error('Database fetch error:', error);
        toast({
          title: "Error fetching articles",
          description: "Please try again later",
          variant: "destructive"
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data: data || [],
    isLoading,
    error,
  };
};
