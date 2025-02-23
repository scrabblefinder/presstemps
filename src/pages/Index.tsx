
import React, { useState, useEffect } from "react";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { LoadingSkeleton } from "@/components/news/LoadingSkeleton";
import { SearchSidebar } from "@/components/news/SearchSidebar";
import { PopularNewsSidebar } from "@/components/news/PopularNewsSidebar";
import { MainContent } from "@/components/news/MainContent";
import { usePopularArticles } from "@/hooks/usePopularArticles";
import { useAdvertisements } from "@/hooks/useAdvertisements";
import { useArticleTracking } from "@/hooks/useArticleTracking";
import { sortAndFilterArticles } from "@/utils/articles/articleUtils";

const ARTICLES_PER_PAGE = 10;

interface IndexProps {
  selectedCategory?: string;
}

const Index = ({ selectedCategory = 'all' }: IndexProps) => {
  const { data: allArticles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: popularArticles = [] } = usePopularArticles();
  const { data: advertisements = [] } = useAdvertisements();
  const { trackArticleClick } = useArticleTracking();

  const filteredArticles = React.useMemo(() => 
    sortAndFilterArticles(allArticles || [], selectedCategory, searchQuery, advertisements),
    [allArticles, selectedCategory, searchQuery, advertisements]
  );

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <main className="container mx-auto px-4 py-8 flex-1">
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-ink-light">Failed to load articles. Please try again later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MainContent 
            articles={paginatedArticles}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onArticleClick={trackArticleClick}
          />

          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <SearchSidebar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <PopularNewsSidebar articles={popularArticles} />
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Index;
