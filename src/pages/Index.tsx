
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { useState } from "react";
import { RSSArticle } from "@/utils/rssUtils";
import { LoadingSkeleton } from "@/components/news/LoadingSkeleton";
import { ArticleList } from "@/components/news/ArticleList";
import { Pagination } from "@/components/news/Pagination";

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

const getCategoryFromSource = (source: string): string => {
  const categoryMap: Record<string, string> = {
    theverge: 'tech',
    techcrunch: 'tech',
    wired: 'tech',
    reuters: 'world',
    ap: 'world',
    bbc: 'world',
    guardian: 'world',
    nytimes: 'world',
    wsj: 'world',
    bloomberg: 'business',
    forbes: 'business',
    economist: 'business',
    nature: 'science',
    newscientist: 'science',
    scientific: 'science',
    variety: 'entertainment',
    hollywood: 'entertainment',
    rollingstone: 'entertainment',
    espn: 'sports',
    sports_illustrated: 'sports'
  };
  return categoryMap[source] || 'general';
};

const diversifyArticles = (articles: RSSArticle[], selectedCategory: string): RSSArticle[] => {
  // Filter articles by selected category if not "all"
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => getCategoryFromSource(article.category) === selectedCategory);

  // Group articles by source within the selected category
  const articlesBySource = filteredArticles.reduce((acc, article) => {
    const source = article.category;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(article);
    return acc;
  }, {} as Record<string, RSSArticle[]>);

  // Take up to 3 most recent articles from each source
  const diversifiedArticles: RSSArticle[] = [];
  Object.values(articlesBySource).forEach(sourceArticles => {
    const recentSourceArticles = sourceArticles
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    diversifiedArticles.push(...recentSourceArticles);
  });

  // Final shuffle to mix articles from different sources
  return shuffleArray(diversifiedArticles);
};

const Index = () => {
  const { data: articles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing categories
  };

  // First diversify and filter articles
  const diversifiedArticles = diversifyArticles(articles || [], selectedCategory);
  const totalPages = Math.ceil(diversifiedArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = diversifiedArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header onCategoryChange={handleCategoryChange} activeCategory={selectedCategory} />
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
                <h2 className="text-xl font-semibold mb-4 text-ink-dark">Sidebar</h2>
                <p className="text-ink-light">Content coming soon...</p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
