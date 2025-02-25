
import { RSSArticle } from "@/utils/types/rssTypes";
import { Clock3 } from "lucide-react";

interface ArticleListProps {
  articles: RSSArticle[];
  calculateReadingTime: (date: string) => number;
  onArticleClick?: (url: string) => void;
}

export const ArticleList = ({ articles, calculateReadingTime, onArticleClick }: ArticleListProps) => {
  const getCategoryDisplayName = (categoryId: string | number, isAd?: boolean): string => {
    if (isAd) {
      return 'Ad';
    }
    
    console.log('Category ID received:', categoryId, 'Type:', typeof categoryId);
    
    if (!categoryId) {
      console.log('Category ID is undefined or null');
      return 'Uncategorized';
    }

    const id = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
    console.log('Parsed category ID:', id);
    
    const categoryMap: Record<number | string, string> = {
      1: 'Technology',
      2: 'Science',
      3: 'Business',
      4: 'Entertainment',
      5: 'World News',
      6: 'Politics',
      7: 'US',
      8: 'Sports',
      9: 'World News',
      10: 'Lifestyle',
      'world': 'World News',
      'World News': 'World News',
      'World': 'World News'
    };

    const displayName = categoryMap[id] || categoryMap[categoryId] || 'Uncategorized';
    console.log('Display name chosen:', displayName);
    return displayName;
  };

  console.log('Articles received in ArticleList:', articles);

  return (
    <div className="space-y-8">
      {articles.map((article) => {
        console.log('Processing article:', article.title, 'Category:', article.category);
        return (
          <article 
            key={article.url}
            className="group block"
            itemScope 
            itemType="https://schema.org/NewsArticle"
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onArticleClick?.(article.url)}
              className="flex gap-6 items-start p-4 rounded-lg hover:bg-white transition-colors"
            >
              <div className="flex-shrink-0 w-48 h-32 overflow-hidden rounded-lg">
                <img
                  src={article.image}
                  alt={`Image for article: ${article.title}`}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  itemProp="image"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 text-sm mb-2">
                  <span className="text-blue-600 font-medium" itemProp="articleSection">
                    {getCategoryDisplayName(article.category, article.isAd)}
                  </span>
                  <span className="text-ink-light">•</span>
                  <span className="text-ink-light" itemProp="publisher">
                    {article.source}
                  </span>
                </div>
                <h3 
                  className="text-xl font-semibold text-ink-dark group-hover:text-ink mb-2"
                  itemProp="headline"
                >
                  {article.title}
                </h3>
                <p 
                  className="text-ink-light text-sm line-clamp-2 mb-3"
                  itemProp="description"
                >
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-ink-light">
                  <Clock3 className="w-3 h-3" />
                  <span>
                    <meta itemProp="datePublished" content={article.date} />
                    {calculateReadingTime(article.date)} min read
                  </span>
                </div>
              </div>
            </a>
          </article>
        );
      })}
    </div>
  );
};
