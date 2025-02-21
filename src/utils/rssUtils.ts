
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
  // Tech News
  theverge: 'The Verge',
  techcrunch: 'TechCrunch',
  wired: 'Wired',
  
  // General News
  reuters: 'Reuters',
  ap: 'Associated Press',
  bbc: 'BBC News',
  guardian: 'The Guardian',
  nytimes: 'The New York Times',
  wsj: 'Wall Street Journal',
  
  // Business & Finance
  bloomberg: 'Bloomberg',
  forbes: 'Forbes',
  economist: 'The Economist',
  
  // Science & Technology
  nature: 'Nature',
  newscientist: 'New Scientist',
  scientific: 'Scientific American',
  
  // Entertainment & Culture
  variety: 'Variety',
  hollywood: 'Hollywood Reporter',
  rollingstone: 'Rolling Stone',
  
  // Sports
  espn: 'ESPN',
  sports_illustrated: 'Sports Illustrated'
};

const getDefaultImage = (category: string) => {
  const defaultImages = {
    theverge: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
    techcrunch: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    wired: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    reuters: 'https://images.unsplash.com/photo-1584714268709-c3dd9c92b378',
    ap: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
    bbc: 'https://images.unsplash.com/photo-1589262804704-c5aa9e6def89',
    guardian: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167',
    nytimes: 'https://images.unsplash.com/photo-1568306340504-8cd352daf827',
    wsj: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e',
    bloomberg: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    forbes: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105',
    economist: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0',
    nature: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    newscientist: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    scientific: 'https://images.unsplash.com/photo-1576319155264-99536e0be1ee',
    variety: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0',
    hollywood: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf',
    rollingstone: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    espn: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    sports_illustrated: 'https://images.unsplash.com/photo-1579010175856-cb43ccf1afb7'
  };
  return defaultImages[category as keyof typeof defaultImages] || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167';
};

const decodeHTMLEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
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
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
      trimValues: true,
      parseTagValue: false,
    });

    const feed = parser.parse(data);
    
    const channel = feed?.rss?.channel || feed?.feed || feed;
    if (!channel) {
      console.error(`Invalid feed structure for ${categorySlug}:`, feed);
      return [];
    }

    const items = channel.item || channel.entry || [];
    const itemArray = Array.isArray(items) ? items : [items];

    const articles = itemArray.slice(0, 10).map((item: any) => {
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

      // Use default image if no image was found
      if (!image || !image.startsWith('http')) {
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

    console.log(`Success: ${categorySlug} - ${articles.length} articles`);
    return articles;

  } catch (error) {
    console.error(`Error fetching RSS feed for ${categorySlug}:`, error);
    return [];
  }
};
