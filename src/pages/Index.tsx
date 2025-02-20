
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
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
              <section key={category} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-playfair text-xl font-semibold text-ink-dark capitalize">
                    {category}
                  </h2>
                  <Link 
                    to={`/${category}`}
                    className="flex items-center gap-1 text-xs text-ink hover:text-ink-dark transition-colors"
                  >
                    View all <ExternalLink size={14} />
                  </Link>
                </div>

                {categoryArticles && categoryArticles[0] && (
                  <div className="space-y-4">
                    <Link to={`/${category}/${categoryArticles[0].slug}`} className="block group">
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
                        <img
                          src={categoryArticles[0].image_url}
                          alt={categoryArticles[0].title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-medium text-ink-dark group-hover:text-ink transition-colors line-clamp-2">
                        {categoryArticles[0].title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs text-ink-light">
                        <span>{categoryArticles[0].source}</span>
                        <span>{categoryArticles[0].published_at ? 
                          new Date(categoryArticles[0].published_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </Link>

                    <div className="space-y-3 mt-4 pt-4 border-t border-paper-dark/10">
                      {categoryArticles?.slice(1, 5).map((article) => (
                        <Link
                          key={article.id}
                          to={`/${category}/${article.slug}`}
                          className="block group"
                        >
                          <h4 className="text-sm font-medium text-ink-light group-hover:text-ink-dark transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-2 text-xs text-ink-light/75">
                            <span>{article.source}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
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
