
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeeds } from '@/utils/rssUtils';
import { useToast } from "@/components/ui/use-toast";

const RSS_FEEDS = {
  politics: 'https://feeds.feedburner.com/dailykos/index',
  tech: 'https://feeds.arstechnica.com/arstechnica/index?format=xml',
  sports: 'https://api.foxsports.com/v1/rss?partnerKey=zBaFxRyGKCfxBagJG9b8pqLyndmvo7UU',
  entertainment: 'https://www.engadget.com/rss.xml',
  lifestyle: 'https://www.lifehacker.com/rss',
  business: 'https://feeds.feedburner.com/entrepreneur/latest',
  us: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
  world: 'http://feeds.bbci.co.uk/news/world/rss.xml'
};

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        if (category && RSS_FEEDS[category as keyof typeof RSS_FEEDS]) {
          return await fetchRSSFeeds(RSS_FEEDS[category as keyof typeof RSS_FEEDS], category);
        }
        if (!category) {
          const allResults = await Promise.all(
            Object.entries(RSS_FEEDS).map(([cat, url]) => 
              fetchRSSFeeds(url, cat)
            )
          );
          return allResults.flat();
        }
        return [];
      } catch (error) {
        console.error('RSS fetch error:', error);
        toast({
          title: "Error fetching articles",
          description: "Please try again later",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });

  return {
    data,
    isLoading,
    error,
  };
};
