
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeeds } from '@/utils/rssUtils';
import { useToast } from "@/components/ui/use-toast";

const RSS_FEEDS = {
  tech: 'https://techcrunch.com/feed/',
  sports: 'https://www.espn.com/espn/rss/news',
  entertainment: 'https://variety.com/feed/',
  lifestyle: 'https://www.today.com/lifestyle/rss',
  business: 'https://www.cnbc.com/id/10001147/device/rss/rss.html',
  us: 'https://www.cbsnews.com/latest/rss/us',
  world: 'https://www.cbsnews.com/latest/rss/world',
  politics: 'https://www.cbsnews.com/latest/rss/politics'
};

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        if (category && RSS_FEEDS[category as keyof typeof RSS_FEEDS]) {
          const results = await fetchRSSFeeds(RSS_FEEDS[category as keyof typeof RSS_FEEDS], category);
          console.log(`Fetched ${category} articles:`, results);
          if (results.length === 0) {
            console.warn(`No articles found for category: ${category}`);
          }
          return results;
        }
        if (!category) {
          console.log('Fetching all categories...');
          const results = await Promise.allSettled(
            Object.entries(RSS_FEEDS).map(([cat, url]) => 
              fetchRSSFeeds(url, cat)
            )
          );
          
          const allArticles = results.reduce((acc, result, index) => {
            if (result.status === 'fulfilled') {
              console.log(`Successfully fetched ${Object.keys(RSS_FEEDS)[index]}:`, result.value.length, 'articles');
              return [...acc, ...result.value];
            } else {
              console.error(`Failed to fetch ${Object.keys(RSS_FEEDS)[index]}:`, result.reason);
              return acc;
            }
          }, []);

          console.log('Total articles fetched:', allArticles.length);

          if (allArticles.length === 0) {
            toast({
              title: "No articles found",
              description: "Please try again later",
              variant: "destructive"
            });
          }

          return allArticles;
        }
        return [];
      } catch (error) {
        console.error('RSS fetch error:', error);
        toast({
          title: "Error fetching articles",
          description: "Please try again later",
          variant: "destructive"
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  return {
    data: data || [],
    isLoading,
    error,
  };
};
