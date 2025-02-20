
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeed, RSSArticle } from '@/utils/rssUtils';

export const useRSSFeed = () => {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () => fetchRSSFeed('https://feeds.arstechnica.com/arstechnica/index'),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });
};
