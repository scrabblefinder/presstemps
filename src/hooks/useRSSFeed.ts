
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeeds } from '@/utils/rssUtils';
import { useToast } from "@/components/ui/use-toast";

const RSS_FEEDS = {
  tech: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  sports: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
  entertainment: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
  lifestyle: 'https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml',
  business: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  us: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
  world: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  politics: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml'
};

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        console.log('Starting RSS feed fetch...');
        
        if (category && RSS_FEEDS[category as keyof typeof RSS_FEEDS]) {
          console.log(`Fetching category: ${category}`);
          const results = await fetchRSSFeeds(RSS_FEEDS[category as keyof typeof RSS_FEEDS], category);
          console.log(`Results for ${category}:`, results);
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
            const category = Object.keys(RSS_FEEDS)[index];
            if (result.status === 'fulfilled') {
              console.log(`Success: ${category} - ${result.value.length} articles`);
              return [...acc, ...result.value];
            } else {
              console.error(`Failed: ${category}`, result.reason);
              return acc;
            }
          }, []);

          console.log('Total articles:', allArticles.length);

          if (allArticles.length === 0) {
            console.warn('No articles found');
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  return {
    data: data || [],
    isLoading,
    error,
  };
};
