
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { FeedManager } from './FeedManager';
import { supabase } from '@/integrations/supabase/client';

interface Feed {
  id: number;
  name: string;
  url: string;
}

interface CategoryCardProps {
  id: number;
  name: string;
  slug: string;
  onRefresh: (slug: string) => void;
  isRefreshing: boolean;
}

export const CategoryCard = ({ id, name, slug, onRefresh, isRefreshing }: CategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFeeds = async () => {
    if (!isExpanded) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('feeds')
          .select('*')
          .eq('category_id', id)
          .order('name');

        if (error) throw error;
        setFeeds(data);
      } catch (error) {
        console.error('Error loading feeds:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="p-4 border rounded-lg bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">{name}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadFeeds}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRefresh(slug)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Now
        </Button>
      </div>

      {isExpanded && (
        <div className="pt-4 border-t">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading feeds...</p>
          ) : (
            <FeedManager
              categoryId={id}
              categoryName={name}
              feeds={feeds}
              onFeedsUpdate={loadFeeds}
            />
          )}
        </div>
      )}
    </div>
  );
};
