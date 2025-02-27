
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Article } from '@/utils/dbUtils';
import { decodeHTMLEntities } from '@/utils/helpers/textUtils';

interface ArticleCardProps {
  article: Article;
  onDelete: (id: number) => void;
}

export const ArticleCard = ({ article, onDelete }: ArticleCardProps) => {
  return (
    <div className="p-4 border rounded-lg bg-white flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-blue-600 font-medium">
            {article.categories?.name}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            {new Date(article.published_at || article.created_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-lg font-medium mb-2">{decodeHTMLEntities(article.title)}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
      </div>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onDelete(article.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
