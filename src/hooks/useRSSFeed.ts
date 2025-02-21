
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeeds } from '@/utils/rssUtils';
import { useToast } from "@/components/ui/use-toast";

const RSS_FEEDS = {
  // US News
  politico: 'https://www.politico.com/rss/politicopicks.xml',
  hill: 'https://thehill.com/rss/syndicator/19110',
  npr: 'https://feeds.npr.org/1001/rss.xml',
  usatoday: 'https://rssfeeds.usatoday.com/UsatodaycomNation-TopStories',
  foxnews: 'https://moxie.foxnews.com/google-publisher/politics.xml',
  
  // Tech News
  theverge: 'https://www.theverge.com/rss/index.xml',
  techcrunch: 'https://techcrunch.com/feed/',
  wired: 'https://www.wired.com/feed/rss',
  
  // General News
  reuters: 'https://feeds.reuters.com/reuters/topNews',
  ap: 'https://feeds.feedburner.com/TheAssociatedPress-TopHeadlines',
  bbc: 'http://feeds.bbci.co.uk/news/world/rss.xml',
  guardian: 'https://www.theguardian.com/world/rss',
  nytimes: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  wsj: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
  
  // Business & Finance
  bloomberg: 'https://feeds.bloomberg.com/markets/news.rss',
  forbes: 'https://www.forbes.com/innovation/feed/',
  economist: 'https://www.economist.com/business/rss.xml',
  
  // Science & Technology
  nature: 'http://feeds.nature.com/nature/rss/current',
  newscientist: 'https://www.newscientist.com/feed/home/',
  scientific: 'https://rss.sciam.com/ScientificAmerican-Global',
  
  // Entertainment & Culture
  variety: 'https://variety.com/feed/',
  hollywood: 'https://www.hollywoodreporter.com/feed/',
  rollingstone: 'https://www.rollingstone.com/feed/',
  
  // Sports - Updated with more sources
  espn: 'https://www.espn.com/espn/rss/news',
  sports_illustrated: 'https://www.si.com/rss/si_top_stories.rss',
  cbssports: 'https://www.cbssports.com/rss/headlines/',
  yahoosports: 'https://sports.yahoo.com/rss/',
  bleacherreport: 'https://bleacherreport.com/articles/feed',
  nbcsports: 'https://www.nbcsports.com/rss/news',
  skysports: 'https://www.skysports.com/rss/12040' // Premier League news feed
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
          console.log('Articles by category:', allArticles.reduce((acc, article) => {
            const category = article.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>));

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
