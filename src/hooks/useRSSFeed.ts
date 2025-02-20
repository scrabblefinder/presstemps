
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeed } from '@/utils/rssUtils';
import { fetchArticles } from '@/utils/dbUtils';

export const useRSSFeed = () => {
  // First fetch from database
  const dbQuery = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Also fetch from RSS and update database
  useQuery({
    queryKey: ['rss-feed'],
    queryFn: () => fetchRSSFeed('https://feeds.arstechnica.com/arstechnica/index'),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });

  return dbQuery;
};
