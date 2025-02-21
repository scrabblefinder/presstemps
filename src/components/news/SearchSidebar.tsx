
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { RSSArticle } from '@/utils/types/rssTypes';
import { Button } from '../ui/button';

interface SearchSidebarProps {
  articles: RSSArticle[];
  onArticleClick: (article: RSSArticle) => void;
}

export const SearchSidebar = ({ articles, onArticleClick }: SearchSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredArticles = articles.filter(article => {
    const searchContent = `${article.title} ${article.excerpt}`.toLowerCase();
    return searchContent.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-ink-dark">Search Articles</h2>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-ink-light" />
      </div>
      
      {searchQuery && (
        <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto">
          {filteredArticles.length === 0 ? (
            <p className="text-ink-light text-sm">No articles found</p>
          ) : (
            filteredArticles.map((article) => (
              <article 
                key={article.url} 
                className="border-b border-border pb-4 last:border-0"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left hover:bg-accent p-2 rounded-lg"
                  onClick={() => onArticleClick(article)}
                >
                  <div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-ink-light line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Button>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};
