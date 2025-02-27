import { RSSArticle, Advertisement } from "@/utils/types/rssTypes";

export const calculateReadingTime = (date: string): number => {
  if (!date) return 3;
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

const removeDuplicateArticles = (articles: RSSArticle[]): RSSArticle[] => {
  const seen = new Map<string, boolean>();
  return articles.filter(article => {
    const key = `${article.title}-${article.url}`;
    
    if (!seen.has(key)) {
      seen.set(key, true);
      return true;
    }
    
    return false;
  });
};

export const sortAndFilterArticles = (
  articles: RSSArticle[], 
  selectedCategory: string,
  searchQuery: string,
  advertisements: Advertisement[] = []
): RSSArticle[] => {
  let filteredArticles = removeDuplicateArticles(articles);

  if (selectedCategory && selectedCategory !== 'all') {
    filteredArticles = filteredArticles.filter(article => {
      const articleCategory = article.category;
      const normalizedArticleCategory = typeof articleCategory === 'string' 
        ? articleCategory.toLowerCase() 
        : articleCategory ? String(articleCategory).toLowerCase() : '';
      
      return normalizedArticleCategory === selectedCategory.toLowerCase();
    });
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredArticles = filteredArticles.filter(article => 
      article.title?.toLowerCase().includes(query) || 
      article.excerpt?.toLowerCase().includes(query)
    );
  }

  const imageAds = advertisements
    .filter(ad => ad.type === 'image' && ad.is_active && ad.image_url)
    .map(ad => ({
      title: ad.title,
      excerpt: ad.excerpt || '',
      image: ad.image_url,
      category: 'sponsored',
      source: ad.source_text,
      date: ad.created_at || new Date().toISOString(),
      author: 'Sponsor',
      url: ad.url || '#',
      isAd: true
    }));

  return [...filteredArticles, ...imageAds].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};
