
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Advertisement } from "@/utils/types/rssTypes";

export const useAdvertisements = () => {
  return useQuery({
    queryKey: ['advertisements'],
    queryFn: async (): Promise<Advertisement[]> => {
      const { data: ads, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching advertisements:', error);
        return [];
      }

      return ads;
    },
    refetchInterval: 300000,
  });
};
