
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { useState } from "react";
import { RSSArticle } from "@/utils/rssUtils";
import { LoadingSkeleton } from "@/components/news/LoadingSkeleton";
import { ArticleList } from "@/components/news/ArticleList";
import { Pagination } from "@/components/news/Pagination";
import { SearchSidebar } from "@/components/news/SearchSidebar";

const ARTICLES_PER_PAGE = 10;

const calculateReadingTime = (date: string): number => {
  if (!date) return 3;
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

const getCategoryId = (slug: string): number => {
  const categoryMap: Record<string, number> = {
    'technology': 1,
    'science': 2,
    'business': 3,
    'entertainment': 4,
    'world': 5,
    'us': 6,
    'sports': 8,
    'lifestyle': 10
  };
  return categoryMap[slug] || 5; // Default to world news if slug not found
};

const diversifyArticles = (articles: RSSArticle[], selectedCategory: string): RSSArticle[] => {
  console.log('Diversifying articles with category:', selectedCategory);
  console.log('Articles before filtering:', articles);
  
  // First filter articles by selected category
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => {
        const categoryId = getCategoryId(selectedCategory);
        console.log('Filtering article:', article.title, 'Article category:', article.category, 'Selected category ID:', categoryId);
        return article.category === categoryId.toString();
      });

  console.log('Filtered articles:', filteredArticles);

  // Sort all articles by date
  return filteredArticles.sort((a, b) => 
    new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
  );
};

interface IndexProps {
  selectedCategory?: string;
}

const Index = ({ selectedCategory = 'all' }: IndexProps) => {
  const { data: articles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  console.log('Articles from useRSSFeed:', articles);

  const searchFilteredArticles = (articles || []).filter(article => {
    if (!searchQuery) return true;
    const searchContent = `${article.title} ${article.excerpt}`.toLowerCase();
    return searchContent.includes(searchQuery.toLowerCase());
  });

  const diversifiedArticles = diversifyArticles(searchFilteredArticles, selectedCategory);
  const totalPages = Math.ceil(diversifiedArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = diversifiedArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  console.log('Final paginated articles:', paginatedArticles);

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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="animate-fade-in">
                <ArticleList 
                  articles={paginatedArticles}
                  calculateReadingTime={calculateReadingTime}
                />
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-4 bg-white rounded-lg p-6 shadow-sm">
              <SearchSidebar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Index;
