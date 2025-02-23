
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RSSArticle } from "@/utils/types/rssTypes";

export const usePopularArticles = () => {
  return useQuery({
    queryKey: ['popularArticles'],
    queryFn: async (): Promise<RSSArticle[]> => {
      console.log('Fetching popular articles...');
      
      const { data: clickCounts, error: clickError } = await supabase
        .from('article_clicks')
        .select('article_id')
        .not('article_id', 'is', null);

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
    },
    refetchInterval: 60000,
  });
};
