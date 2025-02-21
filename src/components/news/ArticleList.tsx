
import { RSSArticle } from "@/utils/rssUtils";
import { Clock3 } from "lucide-react";

interface ArticleListProps {
  articles: RSSArticle[];
  calculateReadingTime: (date: string) => number;
}

export const ArticleList = ({ articles, calculateReadingTime }: ArticleListProps) => {
  // Helper function to get category display name
  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      theverge: 'Tech',
      techcrunch: 'Tech',
      wired: 'Tech',
      reuters: 'World',
      ap: 'World',
      bbc: 'World',
      guardian: 'World',
      nytimes: 'World',
      wsj: 'World',
      bloomberg: 'Business',
      forbes: 'Business',
      economist: 'Business',
      nature: 'Science',
      newscientist: 'Science',
      scientific: 'Science',
      variety: 'Entertainment',
      hollywood: 'Entertainment',
      rollingstone: 'Entertainment',
      espn: 'Sports',
      sports_illustrated: 'Sports'
    };
    return categoryMap[category] || 'General';
  };

  return (
    <div className="space-y-8">
      {articles.map((article) => (
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
                  {getCategoryDisplayName(article.category)}
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
  );
};
