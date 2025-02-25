
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Advertisement } from "@/utils/types/rssTypes";

export const useAdvertisements = (type?: 'image' | 'text') => {
  return useQuery({
    queryKey: ['advertisements', type],
    queryFn: async (): Promise<Advertisement[]> => {
      let query = supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true);

      if (type) {
        query = query.eq('type', type);
      }

      const { data: ads, error } = await query;

      if (error) {
        console.error('Error fetching advertisements:', error);
        return [];
      }

      return ads;
    },
    refetchInterval: 300000,
  });
};
