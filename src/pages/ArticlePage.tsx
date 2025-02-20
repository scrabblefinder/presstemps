
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlePage() {
  const { category = "", slug = "" } = useParams<{ category: string; slug: string }>();
  const { data: articles, isLoading } = useRSSFeed();

  const article = articles?.find(a => a.url === `/${category}/${slug}`);
  const relatedArticles = articles
    ?.filter(a => a.url !== `/${category}/${slug}`)
    .slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-light flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <article className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-[400px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-paper-light flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center py-12">
            <h1 className="text-2xl font-playfair text-ink-dark">Article not found</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="mb-4">
              <span className="text-sm font-medium text-ink-light">
                {article.category}
              </span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-ink-dark mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-ink-light">
              <span>{article.author}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.source}</span>
            </div>
          </header>

          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-[400px] object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="font-playfair text-2xl font-semibold text-ink-dark mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((article, index) => (
                <ArticleCard key={index} {...article} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
