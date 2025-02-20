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

const RSS_SOURCES = {
  politics: 'Daily Kos',
  tech: 'Ars Technica',
  sports: 'Fox Sports',
  entertainment: 'Engadget',
  lifestyle: 'Lifehacker',
  business: 'Entrepreneur',
};

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
      return imageUrl;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('article_images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error downloading/uploading image:', error);
    return imageUrl;
  }
};

const getDefaultImage = (category: string) => {
  const defaultImages = {
    tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    entertainment: 'https://images.unsplash.com/photo-1586899028174-e7098604235b',
    lifestyle: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659',
    business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
  };
  return defaultImages[category as keyof typeof defaultImages] || defaultImages.tech;
};

const extractImageFromContent = (content: string): string | null => {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
};

export const parseRSSFeed = (xmlData: string, category: string): RSSArticle[] => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true,
    trimValues: false,
    parseTagValue: false,
    processEntities: false,
    tagValueProcessor: (tagName: string, value: string) => value,
  });

  const feed = parser.parse(xmlData);
  const items = feed.rss.channel.item;

  return items.slice(0, 20).map((item: any) => {
    let fullContent = item['content:encoded'] || 
                     item.content || 
                     item.description || 
                     '';

    if (typeof fullContent === 'object') {
      fullContent = fullContent['#text'] || fullContent.toString() || '';
    }

    if (category === 'sports' && item.description) {
      fullContent = item.description;
    }

    let image = item['media:content']?.["@_url"] || 
                item['media:thumbnail']?.["@_url"] ||
                item.enclosure?.["@_url"] ||
                extractImageFromContent(fullContent) ||
                extractImageFromContent(item.description || '');

    if (category === 'sports' && !image) {
      const mediaGroup = item['media:group'];
      if (mediaGroup && mediaGroup['media:content']) {
        const mediaContent = Array.isArray(mediaGroup['media:content']) 
          ? mediaGroup['media:content'][0] 
          : mediaGroup['media:content'];
        image = mediaContent?.["@_url"] || null;
      }
    }

    if (!image) {
      image = getDefaultImage(category);
    }

    const decodedTitle = decodeHTMLEntities(item.title);
    const originalUrl = item.link || item.guid || '';
    
    fullContent = decodeHTMLEntities(fullContent);
    
    const cleanContent = fullContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<img[^>]+height="1"[^>]*>/gi, '')
      .replace(/<img[^>]+width="1"[^>]*>/gi, '')
      .replace(/<img[^>]+style="[^"]*display:\s*none[^"]*"[^>]*>/gi, '')
      .replace(/<p>\s*<a[^>]*>Read full article<\/a>\s*<\/p>/gi, '')
      .replace(/<p>\s*<a[^>]*>Comments<\/a>\s*<\/p>/gi, '')
      .replace(/\r?\n|\r/g, '')
      .trim();

    const source = RSS_SOURCES[category as keyof typeof RSS_SOURCES] || category;

    return {
      title: decodedTitle,
      content: cleanContent,
      excerpt: decodeHTMLEntities(item.description?.replace(/<[^>]+>/g, '').slice(0, 150) + '...') || '',
      image,
      category,
      source,
      date: new Date(item.pubDate).toISOString(),
      author: item.author || source,
      url: originalUrl,
    };
  });
};

export const fetchRSSFeed = async (url: string, categorySlug: string): Promise<RSSArticle[]> => {
  try {
    const categoryId = await getCategoryId(categorySlug);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.text();
    const articles = parseRSSFeed(data, categorySlug);
    
    console.log(`Fetched ${articles.length} articles for ${categorySlug}`);

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
            published_at: article.date,
            url: article.url
          }, {
            onConflict: 'slug'
          });

        if (error) {
          console.error('Error inserting article:', error);
        } else {
          console.log(`Saved article: ${article.title}`);
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
