
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

const extractImageFromContent = (content: string): string | null => {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
};

const parseRSSFeed = (xmlData: string, category: string): RSSArticle[] => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true,
    trimValues: false,
    parseTagValue: false,
    processEntities: false,
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
    const source = RSS_SOURCES[category as keyof typeof RSS_SOURCES] || category;
    
    return {
      title: decodedTitle,
      excerpt: decodeHTMLEntities(item.description?.replace(/<[^>]+>/g, '').slice(0, 150) + '...') || '',
      image,
      category,
      source,
      date: new Date(item.pubDate).toISOString(),
      author: item.author || source,
      url: item.link || item.guid || '',
    };
  });
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
