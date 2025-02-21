
import React from 'react';
import { Flame } from 'lucide-react';
import { RSSArticle } from '@/utils/types/rssTypes';

interface PopularNewsSidebarProps {
  articles: RSSArticle[];
}

export const PopularNewsSidebar = ({ articles }: PopularNewsSidebarProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-ink-dark flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        Most Popular
      </h2>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <a
            key={article.url}
            href={article.url}
            className="group flex gap-3 items-start hover:bg-gray-50 p-2 rounded-lg transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-2xl font-bold text-gray-300 group-hover:text-blue-500 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <h3 className="text-sm text-ink-light group-hover:text-ink-dark transition-colors line-clamp-2">
              {article.title}
            </h3>
          </a>
        ))}
      </div>
    </div>
  );
};
