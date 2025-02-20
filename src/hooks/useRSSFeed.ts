
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeed } from '@/utils/rssUtils';
import { fetchArticles } from '@/utils/dbUtils';

const RSS_FEEDS = {
  tech: 'https://feeds.arstechnica.com/arstechnica/index',
};

export const useRSSFeed = (category?: string) => {
  // First fetch from database
  const dbQuery = useQuery({
    queryKey: ['articles', category],
    queryFn: () => fetchArticles(category),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Also fetch from RSS and update database
  const rssQuery = useQuery({
    queryKey: ['rss-feed', category],
    queryFn: () => {
      // For now, we only have the tech feed
      if (category === 'tech' || !category) {
        return fetchRSSFeed(RSS_FEEDS.tech, 'tech');
      }
      return Promise.resolve([]);
    },
    staleTime: 0, // Set to 0 to fetch immediately
    refetchOnMount: true, // Force fetch on mount
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });

  return dbQuery;
};
