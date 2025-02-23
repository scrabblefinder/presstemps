
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RSSArticle } from "@/utils/types/rssTypes";

export const useAdvertisements = () => {
  return useQuery({
    queryKey: ['advertisements'],
    queryFn: async (): Promise<RSSArticle[]> => {
      const { data: ads, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching advertisements:', error);
        return [];
      }

      return ads.map(ad => ({
        title: ad.title,
        excerpt: ad.excerpt || '',
        image: ad.image_url,
        category: 'AD',
        source: ad.source_text,
        date: ad.created_at,
        author: ad.source_text,
        url: ad.url || '#',
        isAd: true
      }));
    },
    refetchInterval: 300000,
  });
};
