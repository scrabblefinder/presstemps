
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
      'World': 'World News',
      'technology': 'Technology',
      'science': 'Science',
      'business': 'Business',
      'entertainment': 'Entertainment',
      'politics': 'Politics',
      'us': 'US',
      'sports': 'Sports',
      'lifestyle': 'Lifestyle'
    };

    // First try to get the display name directly from the map
    const displayName = categoryMap[categoryId] || categoryMap[id] || 'Uncategorized';
    console.log('Display name chosen:', displayName);
    
    // If we get a string category, try to capitalize first letter
    if (typeof categoryId === 'string' && displayName === 'Uncategorized') {
      return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    }
    
    return displayName;
  };

  const getTechArticleImage = (article: RSSArticle): string => {
    if (article.source === 'TechCrunch' && article.image.includes('unsplash.com')) {
      // Rotate between different tech-themed images for variety
      const techImages = [
        'photo-1488590528505-98d2b5aba04b',
        'photo-1461749280684-dccba630e2f6',
        'photo-1487058792275-0ad4aaf24ca7',
        'photo-1498050108023-c5249f4df085'
      ];
      const index = Math.floor(article.title.length % techImages.length);
      return `https://images.unsplash.com/${techImages[index]}`;
    }
    return article.image;
  };

  console.log('Articles received in ArticleList:', articles);

  return (
    <div className="space-y-6 sm:space-y-8">
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
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-2 sm:p-4 rounded-lg hover:bg-white transition-colors"
            >
              <div className="w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg mx-auto sm:mx-0">
                <img
                  src={getTechArticleImage(article)}
                  alt={`Image for article: ${article.title}`}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  itemProp="image"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 text-xs sm:text-sm mb-2">
                  <span className="text-blue-600 font-medium" itemProp="articleSection">
                    {getCategoryDisplayName(article.category, article.isAd)}
                  </span>
                  <span className="text-ink-light">•</span>
                  <span className="text-ink-light" itemProp="publisher">
                    {article.source}
                  </span>
                </div>
                <h3 
                  className="text-lg sm:text-xl font-semibold text-ink-dark group-hover:text-ink mb-2"
                  itemProp="headline"
                >
                  {article.title}
                </h3>
                <p 
                  className="text-ink-light text-xs sm:text-sm line-clamp-2 mb-3"
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
