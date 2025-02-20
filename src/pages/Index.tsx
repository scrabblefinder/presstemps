
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedArticles && Object.entries(groupedArticles).map(([category, categoryArticles]) => (
              <section key={category} className="relative">
                {/* Category Header */}
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

                {/* Articles Layout */}
                <div className="space-y-6">
                  {/* Featured Article with Image */}
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

                  {/* Secondary Articles - Text Only */}
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
