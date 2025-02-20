
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "react-router-dom";

const Index = () => {
  const { category } = useParams();
  const { data: articles, isLoading, error } = useRSSFeed(category);

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-playfair text-2xl font-semibold text-ink-dark">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} News` : 'Latest Tech News'}
            </h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-ink-light">Failed to load articles. Please try again later.</p>
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  image_url={article.image_url}
                  category={article.categories?.name || 'Tech'}
                  source={article.source}
                  published_at={article.published_at}
                  url={`/${article.categories?.slug || 'tech'}/${article.slug}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-ink-light">No articles found.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
