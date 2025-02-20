
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ExternalLink, Clock3 } from "lucide-react";

const Index = () => {
  const { data: articles, isLoading, error } = useRSSFeed();

  // Group articles by category
  const groupedArticles = articles?.reduce((acc, article) => {
    const category = article.categories?.slug || 'tech';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  // Get remaining articles for the news feed
  const allArticles = articles?.slice(30) || []; // After the first 30 articles used in categories

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            {/* Main Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {groupedArticles && Object.entries(groupedArticles).map(([category, categoryArticles]) => (
                <section key={category} className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-playfair text-2xl font-semibold text-ink-dark capitalize border-b-2 border-ink-dark/10 pb-2">
                      {category}
                    </h2>
                    <Link 
                      to={`/${category}`}
                      className="text-xs font-medium text-ink hover:text-ink-dark transition-colors"
                    >
                      More articles <ExternalLink className="inline w-3 h-3 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-6">
                    {categoryArticles && categoryArticles[0] && (
                      <Link 
                        to={`/${category}/${categoryArticles[0].slug}`}
                        className="block group"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                          <img
                            src={categoryArticles[0].image_url}
                            alt={categoryArticles[0].title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-lg font-medium line-clamp-2 group-hover:text-paper-light transition-colors">
                              {categoryArticles[0].title}
                            </h3>
                            <div className="mt-2 flex items-center gap-3 text-xs text-paper-light/80">
                              <span>{categoryArticles[0].source}</span>
                              <span>{categoryArticles[0].published_at ? 
                                new Date(categoryArticles[0].published_at).toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {categoryArticles?.slice(1, 5).map((article) => (
                        <Link
                          key={article.id}
                          to={`/${category}/${article.slug}`}
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
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* News Feed Section */}
            <section className="mt-12">
              <div className="space-y-8">
                {allArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/${article.categories.slug}/${article.slug}`}
                    className="group block"
                  >
                    <article className="flex gap-6 items-start p-4 rounded-lg hover:bg-white transition-colors">
                      <div className="flex-shrink-0 w-48 h-32 overflow-hidden rounded-lg">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 text-sm mb-2">
                          <span className="text-blue-600 font-medium">
                            {article.categories.slug.toUpperCase()}
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
                          <span>
                            {article.published_at ? 
                              `${Math.ceil((new Date().getTime() - new Date(article.published_at).getTime()) / (1000 * 60))} min read` 
                              : ''}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
