
import { XMLParser } from 'fast-xml-parser';

export interface RSSArticle {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  source: string;
  date: string;
  author: string;
  url: string;
}

const RSS_SOURCES = {
  politics: 'NY Times Politics',
  tech: 'NY Times Technology',
  sports: 'NY Times Sports',
  entertainment: 'NY Times Arts',
  lifestyle: 'NY Times Style',
  business: 'NY Times Business',
  us: 'NY Times US',
  world: 'NY Times World'
};

const decodeHTMLEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const getDefaultImage = (category: string) => {
  const defaultImages = {
    tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    entertainment: 'https://images.unsplash.com/photo-1586899028174-e7098604235b',
    lifestyle: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659',
    business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    politics: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f',
    us: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74',
    world: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4'
  };
  return defaultImages[category as keyof typeof defaultImages] || defaultImages.tech;
};

const extractImageFromContent = (content: string | undefined): string | null => {
  if (!content || typeof content !== 'string') return null;
  
  // Try to find any image URL in the content
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];
  
  // Try to find a media:content tag
  const mediaMatch = content.match(/<media:content[^>]+url="([^">]+)"/);
  if (mediaMatch) return mediaMatch[1];
  
  return null;
};

export const fetchRSSFeeds = async (url: string, categorySlug: string): Promise<RSSArticle[]> => {
  try {
    console.log(`Fetching RSS feed for ${categorySlug}:`, url);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.text();
    console.log(`Received data for ${categorySlug}, length:`, data.length);
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
      trimValues: true,
      parseTagValue: false,
    });

    const feed = parser.parse(data);
    console.log(`Parsed feed for ${categorySlug}:`, feed);
    
    const channel = feed?.rss?.channel || feed?.feed || feed;
    if (!channel) {
      console.error('Invalid feed structure:', feed);
      return [];
    }

    const items = channel.item || channel.entry || [];
    const itemArray = Array.isArray(items) ? items : [items];

    return itemArray.slice(0, 10).map((item: any) => {
      let image = null;
      
      // Try different possible image locations
      if (item['media:content']) {
        const mediaContent = Array.isArray(item['media:content']) 
          ? item['media:content'][0] 
          : item['media:content'];
        image = mediaContent?.["@_url"];
      } 
      
      if (!image && item['media:thumbnail']) {
        image = item['media:thumbnail']?.["@_url"];
      }
      
      if (!image && item.enclosure) {
        image = item.enclosure?.["@_url"];
      }
      
      if (!image) {
        const content = item['content:encoded'] || item.content || item.description;
        image = extractImageFromContent(content);
      }

      // Fallback to default image if none found
      if (!image) {
        image = getDefaultImage(categorySlug);
      }

      const title = decodeHTMLEntities(
        typeof item.title === 'string' ? item.title : item.title?.['#text'] || ''
      );
      
      const description = decodeHTMLEntities(
        typeof item.description === 'string' ? item.description : item.description?.['#text'] || ''
      );

      return {
        title,
        excerpt: description.replace(/<[^>]+>/g, '').slice(0, 150) + '...',
        image,
        category: categorySlug,
        source: RSS_SOURCES[categorySlug as keyof typeof RSS_SOURCES] || categorySlug,
        date: new Date(item.pubDate || item.published || item['dc:date'] || '').toISOString(),
        author: item.author || item.creator || RSS_SOURCES[categorySlug as keyof typeof RSS_SOURCES],
        url: item.link || item.guid || '',
      };
    }).filter(item => item.title && item.url);
  } catch (error) {
    console.error(`Error fetching RSS feed for ${categorySlug}:`, error);
    return [];
  }
};
