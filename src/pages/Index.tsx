
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
          <div className="space-y-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-[300px]" />
                  <div className="lg:col-span-2 space-y-4">
                    {[...Array(4)].map((_, idx) => (
                      <Skeleton key={idx} className="h-8" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-ink-light">Failed to load articles. Please try again later.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedArticles && Object.entries(groupedArticles).map(([category, categoryArticles]) => (
              <section key={category} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-playfair text-2xl font-semibold text-ink-dark capitalize">
                    {category} News
                  </h2>
                  <Link 
                    to={`/${category}`}
                    className="flex items-center gap-2 text-sm text-ink hover:text-ink-dark transition-colors"
                  >
                    View all <ExternalLink size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {categoryArticles && categoryArticles[0] && (
                    <ArticleCard
                      key={categoryArticles[0].id}
                      title={categoryArticles[0].title}
                      excerpt={categoryArticles[0].excerpt || ''}
                      image_url={categoryArticles[0].image_url}
                      category={categoryArticles[0].categories?.name || category}
                      source={categoryArticles[0].source}
                      published_at={categoryArticles[0].published_at}
                      url={`/${category}/${categoryArticles[0].slug}`}
                    />
                  )}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      {categoryArticles?.slice(1, 6).map((article) => (
                        <div key={article.id} className="group">
                          <Link
                            to={`/${category}/${article.slug}`}
                            className="block p-4 bg-white rounded-lg hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-medium text-ink-dark group-hover:text-ink transition-colors line-clamp-2">
                                  {article.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-4 text-xs text-ink-light">
                                  <span>{article.source}</span>
                                  <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Separator className="mt-8" />
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
