
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.4';
import { RSS_FEEDS } from '../shared/rssFeeds.ts';
import { findArticleImage, cleanDescription, decodeHTMLEntities } from '../shared/utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function updateFeeds() {
  console.log('Starting RSS feed updates...');
  
  for (const [categorySlug, url] of Object.entries(RSS_FEEDS)) {
    try {
      console.log(`Fetching ${categorySlug} from ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseAttributeValue: true,
        trimValues: true,
        parseTagValue: false,
      });

      const feed = parser.parse(data);
      const channel = feed?.rss?.channel || feed?.feed || feed;
      if (!channel) continue;

      const items = channel.item || channel.entry || [];
      const itemArray = Array.isArray(items) ? items : [items];
      
      // Get category id
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
        
      if (!categoryData) {
        console.error(`Category ${categorySlug} not found`);
        continue;
      }

      // Process articles
      for (const item of itemArray.slice(0, 10)) {
        const image = findArticleImage(item);
        if (!image) continue;

        const title = decodeHTMLEntities(
          typeof item.title === 'string' ? item.title : item.title?.['#text'] || ''
        );
        
        const content = decodeHTMLEntities(
          typeof item.description === 'string' ? item.description : item.description?.['#text'] || ''
        );

        const originalUrl = item.link || item.guid || '';
        if (!originalUrl || !title) continue;

        // Create URL-friendly slug
        const slug = `${categorySlug}-${encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}`;

        // Upsert article with original URL
        const { error } = await supabase
          .from('articles')
          .upsert({
            slug,
            title,
            content,
            excerpt: cleanDescription(content),
            image_url: image,
            original_image_url: image,
            category_id: categoryData.id,
            source: categorySlug,
            author: item.author || item.creator || categorySlug,
            published_at: new Date(item.pubDate || item.published || item['dc:date'] || '').toISOString(),
            url: originalUrl // Store the original URL
          }, {
            onConflict: 'slug'
          });

        if (error) {
          console.error(`Error upserting article: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${categorySlug}: ${error}`);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await updateFeeds();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
