
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ExternalLink, BookOpen, Newspaper, Camera, Film, TrendingUp } from "lucide-react";

const getCategoryIcon = (category: string) => {
  const icons = {
    tech: <Newspaper className="w-5 h-5" />,
    entertainment: <Film className="w-5 h-5" />,
    lifestyle: <Camera className="w-5 h-5" />,
    business: <TrendingUp className="w-5 h-5" />,
    sports: <BookOpen className="w-5 h-5" />,
  };
  return icons[category as keyof typeof icons] || <Newspaper className="w-5 h-5" />;
};

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
              <section 
                key={category} 
                className="group relative overflow-hidden"
              >
                <div className="relative">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-dark text-white">
                        {getCategoryIcon(category)}
                      </span>
                      <h2 className="font-playfair text-xl font-semibold text-ink-dark capitalize">
                        {category}
                      </h2>
                    </div>
                    <Link 
                      to={`/${category}`}
                      className="flex items-center gap-1 text-xs font-medium text-ink hover:text-ink-dark transition-colors"
                    >
                      More <ExternalLink size={14} />
                    </Link>
                  </div>

                  {/* Featured Article */}
                  {categoryArticles && categoryArticles[0] && (
                    <Link 
                      to={`/${category}/${categoryArticles[0].slug}`} 
                      className="block group/article mb-6"
                    >
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4">
                        <img
                          src={categoryArticles[0].image_url}
                          alt={categoryArticles[0].title}
                          className="w-full h-full object-cover transform group-hover/article:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/article:opacity-100 transition-opacity duration-300" />
                      </div>
                      <h3 className="text-lg font-medium text-ink-dark group-hover/article:text-ink transition-colors line-clamp-2">
                        {categoryArticles[0].title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs text-ink-light">
                        <span className="font-medium">{categoryArticles[0].source}</span>
                        <span>{categoryArticles[0].published_at ? 
                          new Date(categoryArticles[0].published_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </Link>
                  )}

                  {/* Article List */}
                  <div className="space-y-4">
                    {categoryArticles?.slice(1, 5).map((article, index) => (
                      <Link
                        key={article.id}
                        to={`/${category}/${article.slug}`}
                        className="block group/list"
                      >
                        <div className="flex items-start gap-3 group-hover/list:bg-white group-hover/list:shadow-sm rounded-lg p-2 -mx-2 transition-all">
                          <span className="font-playfair text-xl font-medium text-ink-light/30 pt-1">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-ink-light group-hover/list:text-ink-dark transition-colors line-clamp-2">
                              {article.title}
                            </h4>
                            <div className="mt-1 flex items-center gap-2 text-xs text-ink-light/75">
                              <span>{article.source}</span>
                            </div>
                          </div>
                        </div>
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
