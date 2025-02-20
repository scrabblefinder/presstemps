
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from 'dompurify';
import { fetchArticles, fetchArticleBySlug } from "@/utils/dbUtils";

export default function ArticlePage() {
  const { category = "", slug = "" } = useParams<{ category: string; slug: string }>();
  
  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug),
  });

  const { data: articles, isLoading: isLoadingArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => fetchArticles(),
  });

  const relatedArticles = articles
    ?.filter(a => a.slug !== slug)
    .slice(0, 3) || [];

  if (isLoadingArticle || isLoadingArticles) {
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

  const sanitizedContent = DOMPurify.sanitize(article.content, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'figure', 'figcaption', 'div'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
  });

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="mb-4">
              <span className="text-sm font-medium text-ink-light">
                {article.categories?.name || category}
              </span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-ink-dark mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-ink-light">
              {article.author && <span>{article.author}</span>}
              {article.author && <span>•</span>}
              {article.published_at && (
                <>
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                  <span>•</span>
                </>
              )}
              {article.source && <span>{article.source}</span>}
            </div>
          </header>

          {article.image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-lg prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="font-playfair text-2xl font-semibold text-ink-dark mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <ArticleCard 
                  key={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  image_url={article.image_url}
                  category={article.categories?.name || ''}
                  source={article.source}
                  published_at={article.published_at}
                  url={`/${article.categories?.slug || 'tech'}/${article.slug}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
