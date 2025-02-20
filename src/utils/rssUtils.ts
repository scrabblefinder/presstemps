
import { XMLParser } from 'fast-xml-parser';
import { supabase } from "@/integrations/supabase/client";
import { getCategoryId } from './dbUtils';

export interface RSSArticle {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  source: string;
  date: string;
  author: string;
  url: string;
}

const decodeHTMLEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const downloadAndUploadImage = async (imageUrl: string, slug: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const filePath = `${slug}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('article_images')
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: true
      });
      
    if (error) {
      console.error('Storage upload error:', error);
      return imageUrl; // Fallback to original URL if upload fails
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('article_images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error downloading/uploading image:', error);
    return imageUrl; // Fallback to original URL if upload fails
  }
};

export const parseRSSFeed = (xmlData: string): RSSArticle[] => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const feed = parser.parse(xmlData);
  const items = feed.rss.channel.item;

  // Take only the first 20 articles
  return items.slice(0, 20).map((item: any) => {
    let image = item['media:content']?.["@_url"];
    
    if (!image) {
      const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
      image = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800';
    }
    
    const decodedTitle = decodeHTMLEntities(item.title);
    
    const slug = decodedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Get the full content from the content:encoded field if available
    const fullContent = item['content:encoded'] || item.description || '';
    console.log('Article content length:', fullContent.length); // Debug log to check content length

    return {
      title: decodedTitle,
      content: fullContent,
      excerpt: decodeHTMLEntities(item.description?.replace(/<[^>]+>/g, '').slice(0, 150) + '...') || '',
      image,
      category: 'Tech',
      source: 'Ars Technica',
      date: new Date(item.pubDate).toISOString(),
      author: item.author || 'Ars Technica',
      url: `/tech/${slug}`,
    };
  });
};

export const fetchRSSFeed = async (url: string, categorySlug: string): Promise<RSSArticle[]> => {
  try {
    // Get category ID first
    const categoryId = await getCategoryId(categorySlug);

    // Fetch articles from RSS feed
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.text();
    const articles = parseRSSFeed(data);
    
    console.log('Parsed articles:', articles.length);

    // Save articles to database
    for (const article of articles) {
      try {
        const imageUrl = await downloadAndUploadImage(article.image, article.url.split('/').pop()!);
        
        const { error } = await supabase
          .from('articles')
          .upsert({
            title: article.title,
            slug: article.url.split('/').pop(),
            content: article.content,
            excerpt: article.excerpt,
            image_url: imageUrl,
            original_image_url: article.image,
            category_id: categoryId,
            source: article.source,
            author: article.author,
            published_at: article.date
          }, {
            onConflict: 'slug'
          });

        if (error) {
          console.error('Error inserting article:', error);
        }
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }
    
    return articles;
  } catch (error) {
    console.error('Error in fetchRSSFeed:', error);
    throw error;
  }
};
