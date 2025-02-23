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
  console.log('Fetching popular articles...');
  
  const { data: clickCounts, error: clickError } = await supabase
    .from('article_clicks')
    .select('article_id')
    .not('article_id', 'is', null);

  console.log('Click data:', clickCounts);

  if (clickError) {
    console.error('Error fetching click counts:', clickError);
    throw clickError;
  }

  if (!clickCounts?.length) {
    console.log('No click data found');
    return [];
  }

  const clickCountMap = new Map<number, number>();
  for (const click of clickCounts) {
    if (click.article_id) {
      clickCountMap.set(click.article_id, (clickCountMap.get(click.article_id) || 0) + 1);
    }
  }

  const sortedArticleIds = Array.from(clickCountMap.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10)
    .map(([id]) => id);

  if (sortedArticleIds.length === 0) {
    console.log('No valid article IDs found');
    return [];
  }

  console.log('Fetching articles with IDs:', sortedArticleIds);

  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('*')
    .in('id', sortedArticleIds);

  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
    throw articlesError;
  }

  const uniqueArticles = Array.from(
    new Map(articles.map(article => [article.url, article])).values()
  );

  const sortedArticles = uniqueArticles.sort((a, b) => 
    (clickCountMap.get(b.id) || 0) - (clickCountMap.get(a.id) || 0)
  );

  console.log('Unique sorted articles:', sortedArticles);

  return sortedArticles.map(article => ({
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

const fetchAdvertisements = async (): Promise<RSSArticle[]> => {
  const { data: ads, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching advertisements:', error);
    return [];
  }

  return ads.map(ad => ({
    title: ad.title,
    excerpt: ad.excerpt || '',
    image: ad.image_url,
    category: 'AD',
    source: ad.source_text,
    date: ad.created_at,
    author: ad.source_text,
    url: '#',
    isAd: true
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
    refetchInterval: 60000,
  });

  const { data: advertisements = [] } = useQuery({
    queryKey: ['advertisements'],
    queryFn: fetchAdvertisements,
    refetchInterval: 300000,
  });

  const trackArticleClick = async (articleUrl: string) => {
    console.log('Tracking click for article:', articleUrl);
    
    const { data: article } = await supabase
      .from('articles')
      .select('id')
      .eq('url', articleUrl)
      .single();

    if (article?.id) {
      console.log('Inserting click for article ID:', article.id);
      await supabase.from('article_clicks').insert({
        article_id: article.id
      });
    }
  };

  const filteredArticles = React.useMemo(() => {
    const articles = (allArticles || []).filter(article => {
      const matchesCategory = selectedCategory === 'all' || 
        article.category === selectedCategory;
      
      if (!matchesCategory) return false;

      if (!searchQuery) return true;
      const searchContent = `${article.title} ${article.excerpt}`.toLowerCase();
      return searchContent.includes(searchQuery.toLowerCase());
    });

    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.url, article])).values()
    );

    const sortedArticles = uniqueArticles.sort((a, b) => 
      new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
    );

    if (advertisements.length > 0) {
      sortedArticles.splice(3, 0, ...advertisements);
    }

    return sortedArticles;
  }, [allArticles, selectedCategory, searchQuery, advertisements]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

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
