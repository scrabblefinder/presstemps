
export const calculateReadingTime = (date: string): number => {
  if (!date) return 3;
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

export const sortAndFilterArticles = (
  articles: any[],
  selectedCategory: string,
  searchQuery: string,
  advertisements: any[]
) => {
  const filtered = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || 
      article.category === selectedCategory;
    
    if (!matchesCategory) return false;

    if (!searchQuery) return true;
    const searchContent = `${article.title} ${article.excerpt}`.toLowerCase();
    return searchContent.includes(searchQuery.toLowerCase());
  });

  const uniqueArticles = Array.from(
    new Map(filtered.map(article => [article.url, article])).values()
  );

  const sortedArticles = uniqueArticles.sort((a, b) => 
    new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
  );

  if (advertisements.length > 0) {
    sortedArticles.splice(3, 0, ...advertisements);
  }

  return sortedArticles;
};
