
import { supabase } from "@/integrations/supabase/client";

export const useArticleTracking = () => {
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

  return { trackArticleClick };
};
