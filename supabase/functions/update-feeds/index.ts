
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { fetchRSSFeeds } from '../shared/utils.ts';
import { RSS_SOURCES } from '../shared/rssFeeds.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function processCategory(categorySlug: string, categoryId: number) {
  console.log(`Processing category: ${categorySlug}`);
  try {
    const sourceUrl = RSS_SOURCES[categoryId.toString()];
    if (!sourceUrl) {
      console.error(`No RSS source found for category ID: ${categoryId}`);
      return [];
    }

    const articles = await fetchRSSFeeds(sourceUrl, categoryId.toString());
    console.log(`Fetched ${articles.length} articles for category ${categoryId}`);

    for (const article of articles) {
      if (!article.title || !article.url) {
        console.log('Skipping article due to missing title or URL');
        continue;
      }

      const slug = `${categoryId}-${encodeURIComponent(
        article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      )}`;

      const { error: upsertError } = await supabase
        .from('articles')
        .upsert({
          slug,
          title: article.title,
          content: article.excerpt,
          excerpt: article.excerpt.substring(0, 300) + '...',
          image_url: article.image,
          original_image_url: article.image,
          category_id: categoryId,
          source: article.source,
          author: article.author,
          published_at: article.date,
          url: article.url
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error(`Error upserting article ${slug}:`, upsertError);
      } else {
        console.log(`Successfully saved/updated article: ${slug}`);
      }
    }

    return articles;
  } catch (error) {
    console.error(`Error processing category ${categoryId}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting RSS feed update process');
    
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      throw categoriesError;
    }

    console.log(`Found ${categories.length} categories to process`);

    // Process each category
    const results = await Promise.all(
      categories.map(category => 
        processCategory(category.slug, category.id)
      )
    );

    const totalArticles = results.reduce((sum, articles) => sum + articles.length, 0);
    console.log(`Update complete. Processed ${totalArticles} articles across ${categories.length} categories`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${totalArticles} articles` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in update-feeds function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
