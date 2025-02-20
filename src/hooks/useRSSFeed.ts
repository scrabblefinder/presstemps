
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeed } from '@/utils/rssUtils';
import { fetchArticles } from '@/utils/dbUtils';
import { useToast } from "@/components/ui/use-toast";

const RSS_FEEDS = {
  tech: 'https://feeds.arstechnica.com/arstechnica/index?format=xml',
};

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();

  // Fetch from database first
  const dbQuery = useQuery({
    queryKey: ['articles', category],
    queryFn: async () => {
      try {
        const articles = await fetchArticles(category);
        return articles;
      } catch (error) {
        console.error('Database fetch error:', error);
        toast({
          title: "Error fetching articles",
          description: "Please try again later",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 0, // Set to 0 to always fetch fresh data
    refetchOnMount: true, // Always refetch when component mounts
    gcTime: 0, // Don't cache data
  });

  // Fetch RSS and update database in background
  useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        const result = await fetchRSSFeed(RSS_FEEDS.tech, 'tech');
        // Invalidate the articles query to show new content
        dbQuery.refetch();
        return result;
      } catch (error) {
        console.error('RSS fetch error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    gcTime: 0, // Don't cache RSS results
  });

  return {
    data: dbQuery.data,
    isLoading: dbQuery.isLoading,
    error: dbQuery.error,
  };
};
