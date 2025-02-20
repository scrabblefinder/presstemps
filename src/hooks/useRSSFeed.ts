import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRSSFeed } from '@/utils/rssUtils';
import { fetchArticles } from '@/utils/dbUtils';
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const RSS_FEEDS = {
  politics: 'https://feeds.feedburner.com/dailykos/index',
  tech: 'https://feeds.arstechnica.com/arstechnica/index?format=xml',
  sports: 'https://api.foxsports.com/v1/rss?partnerKey=zBaFxRyGKCfxBagJG9b8pqLyndmvo7UU',
  entertainment: 'https://www.engadget.com/rss.xml',
  lifestyle: 'https://www.lifehacker.com/rss',
  business: 'https://feeds.feedburner.com/entrepreneur/latest',
  us: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
  world: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
};

export const useRSSFeed = (category?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          queryClient.invalidateQueries({ queryKey: ['articles'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

  useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        if (category && RSS_FEEDS[category as keyof typeof RSS_FEEDS]) {
          const result = await fetchRSSFeed(RSS_FEEDS[category as keyof typeof RSS_FEEDS], category);
          queryClient.invalidateQueries({ queryKey: ['articles'] });
          return result;
        }
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
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
    gcTime: 0,
  });

  return {
    data: dbQuery.data,
    isLoading: dbQuery.isLoading,
    error: dbQuery.error,
  };
};
