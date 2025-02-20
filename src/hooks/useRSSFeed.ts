
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRSSFeed } from '@/utils/rssUtils';
import { fetchArticles } from '@/utils/dbUtils';
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const RSS_FEEDS = {
  tech: 'https://feeds.arstechnica.com/arstechnica/index?format=xml',
  sports: 'https://www.espn.com/espn/rss/news',
  entertainment: 'https://variety.com/feed/',
  lifestyle: 'https://www.lifehacker.com/rss',
  business: 'https://feeds.feedburner.com/entrepreneur/latest',
};

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Subscribe to database changes
  useEffect(() => {
    const channel = supabase
      .channel('articles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles',
        },
        () => {
          // Invalidate and refetch queries when any change occurs
          queryClient.invalidateQueries({ queryKey: ['articles'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });

  // Fetch RSS and update database in background
  useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        if (category && RSS_FEEDS[category as keyof typeof RSS_FEEDS]) {
          const result = await fetchRSSFeed(RSS_FEEDS[category as keyof typeof RSS_FEEDS], category);
          queryClient.invalidateQueries({ queryKey: ['articles'] });
          return result;
        }
        // If no category specified or on homepage, fetch all feeds
        if (!category) {
          const allResults = await Promise.all(
            Object.entries(RSS_FEEDS).map(([cat, url]) => 
              fetchRSSFeed(url, cat)
            )
          );
          queryClient.invalidateQueries({ queryKey: ['articles'] });
          return allResults.flat();
        }
        return [];
      } catch (error) {
        console.error('RSS fetch error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    gcTime: 0,
  });

  return {
    data: dbQuery.data,
    isLoading: dbQuery.isLoading,
    error: dbQuery.error,
  };
};
