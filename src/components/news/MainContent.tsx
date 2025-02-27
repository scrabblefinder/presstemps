import React from 'react';
import { RSSArticle } from "@/utils/types/rssTypes";
import { ArticleList } from "./ArticleList";
import { Pagination } from "./Pagination";
import { calculateReadingTime } from "@/utils/articles/articleUtils";

interface MainContentProps {
  articles: RSSArticle[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onArticleClick: (url: string) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  articles,
  currentPage,
  totalPages,
  onPageChange,
  onArticleClick,
}) => {
  // Filter out text advertisements - ONLY keep regular articles and image ads
  const filteredArticles = articles.filter(article => {
    // If it's an ad, make sure it has an image (keep image ads only)
    if (article.isAd) {
      return article.image && article.image.length > 0;
    }
    
    // Always keep regular articles
    return true;
  });

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-fade-in">
          <ArticleList 
            articles={filteredArticles}
            calculateReadingTime={calculateReadingTime}
            onArticleClick={onArticleClick}
          />
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
