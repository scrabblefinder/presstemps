
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RSSArticle } from "@/utils/rssUtils";

const ARTICLES_PER_PAGE = 10;

const CATEGORY_ORDER = [
  'politics',
  'sports',
  'business',
  'tech',
  'entertainment',
  'lifestyle',
  'us',
  'world'
];

const calculateReadingTime = (date: string): number => {
  if (!date) return 3; // Default reading time
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  // Cap reading time between 2 and 8 minutes
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

const Index = () => {
  const { data: articles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);

  const groupedArticles = articles?.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, RSSArticle[]>);

  const orderedCategories = CATEGORY_ORDER.filter(category => groupedArticles?.[category]);

  const allArticles = articles?.slice(30) || []; // After the first 30 articles used in categories
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[200px]" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, idx) => (
                    <Skeleton key={idx} className="h-6" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-ink-light">Failed to load articles. Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {orderedCategories.map(category => (
                <section key={category} className="relative">
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

                  <div className="space-y-6">
                    {groupedArticles[category]?.[0] && (
                      <a 
                        href={groupedArticles[category][0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                          <img
                            src={groupedArticles[category][0].image}
                            alt={groupedArticles[category][0].title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-lg font-medium line-clamp-2 group-hover:text-paper-light transition-colors">
                              {groupedArticles[category][0].title}
                            </h3>
                            <div className="mt-2 flex items-center gap-3 text-xs text-paper-light/80">
                              <span>{groupedArticles[category][0].source}</span>
                              <span>{new Date(groupedArticles[category][0].date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {groupedArticles[category]?.slice(1, 5).map((article) => (
                        <a
                          key={article.url}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <article className="h-full">
                            <h4 className="text-sm font-medium text-ink-light group-hover:text-ink-dark transition-colors line-clamp-3">
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
                </section>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  {paginatedArticles.map((article) => (
                    <a
                      key={article.url}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <article className="flex gap-6 items-start p-4 rounded-lg hover:bg-white transition-colors">
                        <div className="flex-shrink-0 w-48 h-32 overflow-hidden rounded-lg">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 text-sm mb-2">
                            <span className="text-blue-600 font-medium">
                              {article.category.toUpperCase()}
                            </span>
                            <span className="text-ink-light">•</span>
                            <span className="text-ink-light">{article.source}</span>
                          </div>
                          <h3 className="text-xl font-semibold text-ink-dark group-hover:text-ink mb-2">
                            {article.title}
                          </h3>
                          <p className="text-ink-light text-sm line-clamp-2 mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-ink-light">
                            <Clock3 className="w-3 h-3" />
                            <span>{calculateReadingTime(article.date)} min read</span>
                          </div>
                        </div>
                      </article>
                    </a>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-ink-light">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
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
