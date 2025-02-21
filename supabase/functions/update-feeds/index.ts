
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RSS_FEEDS = {
  'reuters': 'https://www.rss-url.com/feed.xml',  // We'll add more feeds here
  'ap': 'https://www.ap.org/feed.xml',
  'bbc': 'https://feeds.bbci.co.uk/news/rss.xml',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function updateFeeds() {
  console.log('Starting RSS feed updates...');
  
  for (const [source, url] of Object.entries(RSS_FEEDS)) {
    try {
      console.log(`Fetching ${source} from ${url}`);
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
      
      // Get category id for this source
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', source)
        .single();
        
      if (!categoryData) {
        console.error(`Category ${source} not found`);
        continue;
      }

      // Process articles
      for (const item of itemArray.slice(0, 10)) {
        const title = typeof item.title === 'string' ? item.title : item.title?.['#text'] || '';
        const content = typeof item.description === 'string' ? item.description : item.description?.['#text'] || '';
        const url = item.link || item.guid || '';
        
        if (!url || !title) {
          console.log(`Skipping article "${title}" due to missing URL or title`);
          continue;
        }

        const slug = `${source}-${encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}`;

        const article = {
          slug,
          title,
          content,
          excerpt: content.slice(0, 200) + '...',
          image_url: 'https://picsum.photos/800/400', // Placeholder image
          category_id: categoryData.id,
          source,
          author: item.author || item.creator || source,
          published_at: new Date(item.pubDate || item.published || item['dc:date'] || '').toISOString(),
          url
        };

        // Upsert article
        const { error } = await supabase
          .from('articles')
          .upsert(article, {
            onConflict: 'slug'
          });

        if (error) {
          console.error(`Error upserting article: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${source}: ${error}`);
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
