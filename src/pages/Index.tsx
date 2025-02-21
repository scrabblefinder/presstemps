
import React, { useState, useEffect } from "react";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { RSSArticle } from "@/utils/rssUtils";
import { LoadingSkeleton } from "@/components/news/LoadingSkeleton";
import { ArticleList } from "@/components/news/ArticleList";
import { Pagination } from "@/components/news/Pagination";
import { SearchSidebar } from "@/components/news/SearchSidebar";
import { PopularNewsSidebar } from "@/components/news/PopularNewsSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ARTICLES_PER_PAGE = 10;

const calculateReadingTime = (date: string): number => {
  if (!date) return 3;
  const now = new Date();
  const published = new Date(date);
  const diffInMinutes = Math.ceil((now.getTime() - published.getTime()) / (1000 * 60));
  return Math.min(Math.max(diffInMinutes % 7 + 2, 2), 8);
};

const fetchPopularArticles = async (): Promise<RSSArticle[]> => {
  const { data: clickData, error } = await supabase
    .from('article_clicks')
    .select(`
      article_id,
      count: count(*)
    `)
    .group('article_id')
    .order('count', { ascending: false })
    .limit(10);

  if (error) throw error;

  if (!clickData?.length) return [];

  const articleIds = clickData.map(click => click.article_id);
  
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('*')
    .in('id', articleIds);

  if (articlesError) throw articlesError;

  return articles.map(article => ({
    title: article.title,
    excerpt: article.excerpt || '',
    image: article.image_url,
    category: article.category_id?.toString() || '',
    source: article.source || '',
    date: article.published_at || article.created_at,
    author: article.author || '',
    url: article.url || '',
  }));
};

interface IndexProps {
  selectedCategory?: string;
}

const Index = ({ selectedCategory = 'all' }: IndexProps) => {
  const { data: allArticles, isLoading, error } = useRSSFeed();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: popularArticles = [] } = useQuery({
    queryKey: ['popularArticles'],
    queryFn: fetchPopularArticles,
    refetchInterval: 60000, // Refetch every minute
  });

  // Track article clicks
  const trackArticleClick = async (articleUrl: string) => {
    const { data: article } = await supabase
      .from('articles')
      .select('id')
      .eq('url', articleUrl)
      .single();

    if (article?.id) {
      await supabase.from('article_clicks').insert({
        article_id: article.id
      });
    }
  };

  // Filter articles based on category and search query
  const filteredArticles = (allArticles || []).filter(article => {
    const matchesCategory = selectedCategory === 'all' || 
      article.category === selectedCategory;
    
    if (!matchesCategory) return false;

    if (!searchQuery) return true;
    const searchContent = `${article.title} ${article.excerpt}`.toLowerCase();
    return searchContent.includes(searchQuery.toLowerCase());
  });

  // Sort articles by date
  const sortedArticles = filteredArticles.sort((a, b) => 
    new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
  );

  const totalPages = Math.ceil(sortedArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
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
                  onArticleClick={trackArticleClick}
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

          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <SearchSidebar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <PopularNewsSidebar articles={popularArticles} />
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Index;
