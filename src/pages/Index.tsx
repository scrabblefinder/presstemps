
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { useState, useEffect } from "react";
import { RSSArticle } from "@/utils/rssUtils";
import { LoadingSkeleton } from "@/components/news/LoadingSkeleton";
import { CategorySection } from "@/components/news/CategorySection";
import { ArticleList } from "@/components/news/ArticleList";
import { Pagination } from "@/components/news/Pagination";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const ARTICLES_PER_PAGE = 10;

const CATEGORY_ORDER = [
  'us',
  'world',
  'politics',
  'business',
  'tech',
  'entertainment',
  'sports',
  'lifestyle'
];

const calculateReadingTime = (date: string): number => {
  if (!date) return 3;
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

const Index = () => {
  const { data: articles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    console.log('Articles data:', articles);
    console.log('Loading state:', isLoading);
    console.log('Error state:', error);
  }, [articles, isLoading, error]);

  const groupedArticles = articles?.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, RSSArticle[]>) || {};

  const orderedCategories = CATEGORY_ORDER.filter(category => groupedArticles[category]?.length > 0);

  useEffect(() => {
    console.log('Grouped articles:', groupedArticles);
    console.log('Ordered categories:', orderedCategories);
  }, [groupedArticles]);

  const allArticles = articles?.slice(30) || [];
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = allArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-ink-light">Failed to load articles. Please try again later.</p>
            <p className="text-sm text-ink-light/75 mt-2">{error.toString()}</p>
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-light">No articles found. Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {orderedCategories.map(category => {
                const articleList = groupedArticles[category];
                if (!articleList?.length) return null;

                return (
                  <div key={category} className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-playfair text-2xl font-semibold text-ink-dark capitalize border-b-2 border-ink-dark/10 pb-2">
                        {category}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-medium text-ink hover:text-ink-dark transition-colors"
                        asChild
                      >
                        <a href={`/${category}`} className="flex items-center gap-1">
                          More articles <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>

                    {articleList[0] && (
                      <a
                        href={articleList[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group mb-6"
                      >
                        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
                          <img
                            src={articleList[0].image}
                            alt={articleList[0].title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-base font-medium line-clamp-2 text-white group-hover:text-paper-light transition-colors">
                              {articleList[0].title}
                            </h3>
                            <div className="mt-2 flex items-center gap-2 text-xs text-paper-light/80">
                              <span>{articleList[0].source}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    )}

                    <div className="space-y-4">
                      {articleList.slice(1, 5).map((article) => (
                        <a
                          key={article.url}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block"
                        >
                          <article className="h-full">
                            <h4 className="text-sm font-medium text-ink-light group-hover:text-ink-dark transition-colors line-clamp-2">
                              {article.title}
                            </h4>
                            <div className="mt-2 flex items-center gap-2 text-xs text-ink-light/75">
                              <span>{article.source}</span>
                            </div>
                          </article>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ArticleList 
                  articles={paginatedArticles}
                  calculateReadingTime={calculateReadingTime}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>

              <aside className="lg:col-span-1">
                <div className="sticky top-4 bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-ink-dark">Sidebar</h2>
                  <p className="text-ink-light">Content coming soon...</p>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
