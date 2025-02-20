
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
  politics: 'Daily Kos',
  tech: 'Ars Technica',
  sports: 'Fox Sports',
  entertainment: 'Engadget',
  lifestyle: 'Lifehacker',
  business: 'Entrepreneur',
  us: 'Reuters',
  world: 'BBC News'
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
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
};

const parseRSSFeed = (xmlData: string, category: string): RSSArticle[] => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true,
    trimValues: true,
    parseTagValue: false,
  });

  try {
    const feed = parser.parse(xmlData);
    const channel = feed?.rss?.channel || feed?.feed || feed;
    
    if (!channel) {
      console.error('Invalid feed structure:', feed);
      return [];
    }

    const items = channel.item || channel.entry || [];
    const itemArray = Array.isArray(items) ? items : [items];

    return itemArray.slice(0, 20).map((item: any) => {
      let fullContent = '';
      
      // Handle different content fields
      if (item['content:encoded']) {
        fullContent = item['content:encoded'];
      } else if (item.content) {
        fullContent = typeof item.content === 'string' ? item.content : item.content['#text'] || '';
      } else if (item.description) {
        fullContent = item.description;
      }

      // Handle different image locations
      let image = null;
      if (item['media:content']) {
        const mediaContent = Array.isArray(item['media:content']) 
          ? item['media:content'][0] 
          : item['media:content'];
        image = mediaContent?.["@_url"];
      } else if (item['media:thumbnail']) {
        image = item['media:thumbnail']?.["@_url"];
      } else if (item.enclosure) {
        image = item.enclosure?.["@_url"];
      }

      if (!image) {
        image = extractImageFromContent(fullContent) || 
               extractImageFromContent(item.description) || 
               getDefaultImage(category);
      }

      const title = typeof item.title === 'string' ? item.title : item.title?.['#text'] || '';
      const description = typeof item.description === 'string' ? item.description : item.description?.['#text'] || '';
      
      return {
        title: decodeHTMLEntities(title),
        excerpt: decodeHTMLEntities(description.replace(/<[^>]+>/g, '').slice(0, 150) + '...'),
        image,
        category,
        source: RSS_SOURCES[category as keyof typeof RSS_SOURCES] || category,
        date: new Date(item.pubDate || item.published || item['dc:date'] || '').toISOString(),
        author: item.author || item.creator || RSS_SOURCES[category as keyof typeof RSS_SOURCES],
        url: item.link || item.guid || '',
      };
    }).filter(item => item.title && item.url);
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return [];
  }
};

export const fetchRSSFeeds = async (url: string, categorySlug: string): Promise<RSSArticle[]> => {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.text();
    return parseRSSFeed(data, categorySlug);
  } catch (error) {
    console.error('Error in fetchRSSFeeds:', error);
    return [];
  }
};
