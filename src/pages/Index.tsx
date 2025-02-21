
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { useState } from "react";
import { RSSArticle } from "@/utils/rssUtils";
import { LoadingSkeleton } from "@/components/news/LoadingSkeleton";
import { ArticleList } from "@/components/news/ArticleList";
import { Pagination } from "@/components/news/Pagination";
import { SearchSidebar } from "@/components/news/SearchSidebar";

const ARTICLES_PER_PAGE = 10;

const calculateReadingTime = (date: string): number => {
  if (!date) return 3;
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const isUSNews = (title: string, excerpt: string): boolean => {
  const usKeywords = [
    'congress', 'senate', 'house', 'biden', 'trump', 'washington',
    'america', 'american', 'u.s.', 'united states', 'federal',
    'democrat', 'republican', 'gop', 'white house'
  ];
  
  const content = (title + ' ' + excerpt).toLowerCase();
  return usKeywords.some(keyword => content.includes(keyword.toLowerCase()));
};

const isScience = (title: string, excerpt: string): boolean => {
  const scienceKeywords = [
    'research', 'study', 'science', 'scientist', 'discovery',
    'space', 'physics', 'chemistry', 'biology', 'medicine',
    'technology', 'innovation', 'experiment', 'laboratory'
  ];
  
  const content = (title + ' ' + excerpt).toLowerCase();
  return scienceKeywords.some(keyword => content.includes(keyword.toLowerCase()));
};

const getCategoryFromSource = (source: string, article: RSSArticle): string => {
  const baseCategory = {
    // Tech
    theverge: 'tech',
    techcrunch: 'tech',
    wired: 'tech',
    
    // World
    reuters: 'world',
    ap: 'world',
    bbc: 'world',
    guardian: 'world',
    nytimes: 'world',
    wsj: 'world',
    
    // Business
    bloomberg: 'business',
    forbes: 'business',
    economist: 'business',
    
    // Science
    nature: 'science',
    newscientist: 'science',
    scientific: 'science',
    
    // Entertainment
    variety: 'entertainment',
    hollywood: 'entertainment',
    rollingstone: 'entertainment',
    
    // Sports
    espn: 'sports',
    sports_illustrated: 'sports'
  }[source] || 'us'; // Changed default from 'general' to 'us'

  // For US news sources, check content to determine if it's really US news
  if (['politico', 'hill', 'npr', 'usatoday', 'foxnews'].includes(source)) {
    if (isUSNews(article.title, article.excerpt)) {
      return 'us';
    }
    if (isScience(article.title, article.excerpt)) {
      return 'science';
    }
    // For these sources, if not clearly US or Science, default to US
    return 'us';
  }

  return baseCategory;
};

const diversifyArticles = (articles: RSSArticle[], selectedCategory: string): RSSArticle[] => {
  // First filter articles by selected category
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => getCategoryFromSource(article.category, article) === selectedCategory);

  // Group articles by source within the filtered category
  const articlesBySource = filteredArticles.reduce((acc, article) => {
    const source = article.category;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push({
      ...article,
      date: article.date || new Date().toISOString() // Ensure we have a date for sorting
    });
    return acc;
  }, {} as Record<string, RSSArticle[]>);

  // Take up to 3 most recent articles from each source and sort by date
  const diversifiedArticles: RSSArticle[] = [];
  Object.values(articlesBySource).forEach(sourceArticles => {
    const recentSourceArticles = sourceArticles
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    diversifiedArticles.push(...recentSourceArticles);
  });

  // Final shuffle and sort by date for the selected category
  return shuffleArray(diversifiedArticles)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const Index = () => {
  const { data: articles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchQuery(''); // Clear search when changing categories
  };

  const handleArticleClick = (article: RSSArticle) => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  // First filter articles by search query
  const searchFilteredArticles = (articles || []).filter(article => {
    if (!searchQuery) return true;
    const searchContent = `${article.title} ${article.excerpt}`.toLowerCase();
    return searchContent.includes(searchQuery.toLowerCase());
  });

  // Then diversify the filtered articles
  const diversifiedArticles = diversifyArticles(searchFilteredArticles, selectedCategory);
  const totalPages = Math.ceil(diversifiedArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = diversifiedArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-paper-light flex flex-col">
      <Header onCategoryChange={handleCategoryChange} activeCategory={selectedCategory} />
      <main className="container mx-auto px-4 py-8 flex-1">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-ink-light">Failed to load articles. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="animate-fade-in">
                  <ArticleList 
                    articles={paginatedArticles}
                    calculateReadingTime={calculateReadingTime}
                  />
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-4 bg-white rounded-lg p-6 shadow-sm">
                <SearchSidebar 
                  articles={articles || []}
                  onArticleClick={handleArticleClick}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
