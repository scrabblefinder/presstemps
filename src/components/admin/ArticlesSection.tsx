
import { useState } from 'react';
import { Article } from '@/utils/dbUtils';
import { ArticleCard } from './ArticleCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ArticlesSectionProps {
  articles: Article[];
  onDeleteArticle: (id: number) => void;
}

export const ArticlesSection = ({ articles, onDeleteArticle }: ArticlesSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (article.content && article.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (article.source && article.source.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Articles</h2>
      
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search articles by title, content or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          {searchQuery && (
            <Button 
              variant="ghost" 
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {filteredArticles.length} articles found
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onDelete={onDeleteArticle}
            />
          ))
        ) : (
          <div className="p-6 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {searchQuery 
                ? "No articles match your search query." 
                : "No articles available."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
