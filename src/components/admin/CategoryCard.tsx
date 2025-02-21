
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CategoryCardProps {
  id: number;
  name: string;
  slug: string;
  onRefresh: (slug: string) => void;
  isRefreshing: boolean;
}

export const CategoryCard = ({ id, name, slug, onRefresh, isRefreshing }: CategoryCardProps) => {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{name}</h3>
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
    </div>
  );
};
