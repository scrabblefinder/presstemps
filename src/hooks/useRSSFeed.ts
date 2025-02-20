
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRSSFeed } from '@/utils/rssUtils';
import { fetchArticles } from '@/utils/dbUtils';
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const RSS_FEEDS = {
  tech: 'https://feeds.arstechnica.com/arstechnica/index?format=xml',
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
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch on component mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
    gcTime: 0, // Disable garbage collection
  });

  // Fetch RSS and update database in background
  useQuery({
    queryKey: ['rss-feed', category],
    queryFn: async () => {
      try {
        const result = await fetchRSSFeed(RSS_FEEDS.tech, 'tech');
        // Invalidate the articles query to show new content
        queryClient.invalidateQueries({ queryKey: ['articles'] });
        return result;
      } catch (error) {
        console.error('RSS fetch error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    gcTime: 0, // Disable garbage collection
  });

  return {
    data: dbQuery.data,
    isLoading: dbQuery.isLoading,
    error: dbQuery.error,
  };
};
