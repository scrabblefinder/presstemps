
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.4';
import { findArticleImage, cleanDescription, decodeHTMLEntities } from '../shared/utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function updateFeed(categorySlug: string) {
  console.log(`Starting RSS feed update for category: ${categorySlug}`);
  
  try {
    // First get category ID and feeds
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
      
    if (categoryError || !categoryData) {
      throw new Error(`Category ${categorySlug} not found`);
    }

    // Get all feeds for this category
    const { data: feeds, error: feedsError } = await supabase
      .from('feeds')
      .select('*')
      .eq('category_id', categoryData.id);

    if (feedsError) throw feedsError;
    if (!feeds || feeds.length === 0) {
      throw new Error(`No feeds found for category: ${categorySlug}`);
    }

    console.log(`Found ${feeds.length} feeds for category ${categorySlug}`);
    let processedCount = 0;

    // Process each feed
    for (const feed of feeds) {
      try {
        console.log(`Fetching ${feed.name} from ${feed.url}`);
        const response = await fetch(feed.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.text();
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          parseAttributeValue: true,
          trimValues: true,
          parseTagValue: false,
        });

        const parsedFeed = parser.parse(data);
        const channel = parsedFeed?.rss?.channel || parsedFeed?.feed || parsedFeed;
        if (!channel) {
          throw new Error('Invalid feed structure');
        }

        const items = channel.item || channel.entry || [];
        const itemArray = Array.isArray(items) ? items : [items];
        
        console.log(`Found ${itemArray.length} items in feed ${feed.name}`);

        // Process articles
        for (const item of itemArray.slice(0, 10)) {
          const image = findArticleImage(item);
          if (!image) {
            console.log('Skipping article - no image found');
            continue;
          }

          const title = decodeHTMLEntities(
            typeof item.title === 'string' ? item.title : item.title?.['#text'] || ''
          );
          
          const description = decodeHTMLEntities(
            typeof item.description === 'string' ? item.description : item.description?.['#text'] || ''
          );

          const url = item.link || item.guid || '';
          const published = new Date(item.pubDate || item.published || item['dc:date'] || '');
          
          if (!url || !title) {
            console.log(`Skipping article "${title}" due to missing URL or title`);
            continue;
          }

          // Create URL-friendly slug
          const slug = `${categorySlug}-${encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}`;

          const article = {
            slug,
            title,
            content: description,
            excerpt: cleanDescription(description).substring(0, 300) + '...',
            image_url: image,
            original_image_url: image,
            category_id: categoryData.id,
            source: feed.name,
            author: item.author || item.creator || feed.name,
            published_at: published.toISOString(),
            url
          };

          console.log('Attempting to save article:', { title, slug, category: categorySlug });

          // Upsert article
          const { error: upsertError } = await supabase
            .from('articles')
            .upsert(article, {
              onConflict: 'slug',
              ignoreDuplicates: false
            });

          if (upsertError) {
            console.error(`Error upserting article: ${upsertError.message}`);
          } else {
            processedCount++;
            console.log(`Successfully saved article: ${title}`);
          }
        }
      } catch (error) {
        console.error(`Error processing feed ${feed.name}: ${error}`);
      }
    }

    console.log(`Successfully processed ${processedCount} articles for ${categorySlug}`);
    return processedCount;

  } catch (error) {
    console.error(`Error processing ${categorySlug}: ${error}`);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the category
    const { category } = await req.json();
    
    if (!category) {
      throw new Error('Category is required');
    }

    console.log(`Received request to update category: ${category}`);
    const processedCount = await updateFeed(category);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${processedCount} articles for ${category}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
