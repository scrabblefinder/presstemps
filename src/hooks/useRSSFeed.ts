
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeed } from '@/utils/rssUtils';
import { fetchArticles } from '@/utils/dbUtils';
import { useToast } from "@/components/ui/use-toast";

const RSS_FEEDS = {
  tech: 'https://feeds.arstechnica.com/arstechnica/index?format=xml',
};

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();

  // Fetch RSS and update database
  const rssQuery = useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        // For now, we only have the tech feed
        const result = await fetchRSSFeed(RSS_FEEDS.tech, 'tech');
        return result;
      } catch (error) {
        console.error('RSS fetch error:', error);
        toast({
          title: "Error fetching RSS feed",
          description: "Please try again later",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch from database
  const dbQuery = useQuery({
    queryKey: ['articles', category],
    queryFn: async () => {
      try {
        const articles = await fetchArticles(category);
        console.log('Fetched articles:', articles); // Add logging
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
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    data: dbQuery.data,
    isLoading: rssQuery.isLoading || dbQuery.isLoading,
    error: rssQuery.error || dbQuery.error,
  };
};
