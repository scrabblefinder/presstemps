
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { RSSArticle } from "@/utils/rssUtils";

interface CategorySectionProps {
  category: string;
  articles: RSSArticle[];
}

export const CategorySection = ({ category, articles }: CategorySectionProps) => {
  return (
    <section className="relative">
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
        {articles[0] && (
          <a 
            href={articles[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <img
                src={articles[0].image}
                alt={articles[0].title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-medium line-clamp-2 group-hover:text-paper-light transition-colors">
                  {articles[0].title}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-paper-light/80">
                  <span>{articles[0].source}</span>
                  <span>{new Date(articles[0].date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </a>
        )}

        <div className="space-y-4">
          {articles.slice(1, 5).map((article) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
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
  );
};
