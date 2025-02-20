
import { XMLParser } from 'fast-xml-parser';

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

export const parseRSSFeed = (xmlData: string): RSSArticle[] => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const feed = parser.parse(xmlData);
  const items = feed.rss.channel.item;

  return items.map((item: any) => {
    // Extract the featured image from content
    const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
    const image = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800';
    
    // Decode HTML entities in the title
    const decodedTitle = decodeHTMLEntities(item.title);
    
    // Create URL-friendly slug from decoded title
    const slug = decodedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      title: decodedTitle,
      content: item.description || '',
      excerpt: decodeHTMLEntities(item.description?.replace(/<[^>]+>/g, '').slice(0, 150) + '...') || '',
      image,
      category: 'Tech',
      source: 'Ars Technica',
      date: new Date(item.pubDate).toISOString().split('T')[0],
      author: item.author || 'Ars Technica',
      url: `/tech/${slug}`,
    };
  });
};

export const fetchRSSFeed = async (url: string): Promise<RSSArticle[]> => {
  // Use a CORS proxy to fetch the RSS feed
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const data = await response.text();
  return parseRSSFeed(data);
};
