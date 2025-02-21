
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

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getCategorySlug = (categoryId: number): string => {
  const categoryMap: Record<number, string> = {
    1: 'technology',
    2: 'science',
    3: 'business',
    4: 'entertainment',
    5: 'world', // Latest News
    6: 'us', // Politics
    8: 'sports',
    10: 'lifestyle'
  };
  return categoryMap[categoryId] || 'world';
};

const diversifyArticles = (articles: RSSArticle[], selectedCategory: string): RSSArticle[] => {
  // First filter articles by selected category
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => {
        const categorySlug = getCategorySlug(parseInt(article.category));
        return categorySlug === selectedCategory;
      });

  // Group articles by source within the filtered category
  const articlesBySource = filteredArticles.reduce((acc, article) => {
    const source = article.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push({
      ...article,
      date: article.date || new Date().toISOString() // Ensure we have a date for sorting
    });
    return acc;
  }, {} as Record<string, RSSArticle[]>);

  // Take up to 3 most recent articles from each source and sort by date
  const diversifiedArticles: RSSArticle[] = [];
  Object.values(articlesBySource).forEach(sourceArticles => {
    const recentSourceArticles = sourceArticles
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    diversifiedArticles.push(...recentSourceArticles);
  });

  // Final shuffle and sort by date for the selected category
  return shuffleArray(diversifiedArticles)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

interface IndexProps {
  selectedCategory?: string;
}

const Index = ({ selectedCategory = 'all' }: IndexProps) => {
  const { data: articles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleArticleClick = (article: RSSArticle) => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

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
                  articles={paginatedArticles.map(article => ({
                    ...article,
                    category: getCategorySlug(parseInt(article.category))
                  }))}
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
