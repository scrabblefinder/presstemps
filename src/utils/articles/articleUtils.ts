
import { RSSArticle, Advertisement } from "@/utils/types/rssTypes";

export const calculateReadingTime = (date: string): number => {
  if (!date) return 3;
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

export const sortAndFilterArticles = (
  articles: RSSArticle[], 
  selectedCategory: string,
  searchQuery: string,
  advertisements: Advertisement[] = []
): RSSArticle[] => {
  let filteredArticles = articles;
  if (selectedCategory && selectedCategory !== 'all') {
    filteredArticles = articles.filter(article => {
      const normalizedArticleCategory = typeof article.category === 'string' 
        ? article.category.toLowerCase() 
        : article.category?.toString().toLowerCase();
      
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
