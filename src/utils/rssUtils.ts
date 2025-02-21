
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
  
  // Sports - Updated with new sources
  espn: 'ESPN',
  sports_illustrated: 'Sports Illustrated',
  cbssports: 'CBS Sports',
  yahoosports: 'Yahoo Sports',
  bleacherreport: 'Bleacher Report',
  nbcsports: 'NBC Sports',
  skysports: 'Sky Sports'
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
    // Updated sports default images
    espn: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    sports_illustrated: 'https://images.unsplash.com/photo-1579010175856-cb43ccf1afb7',
    cbssports: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff',
    yahoosports: 'https://images.unsplash.com/photo-1583739654245-8c7f99b0c073',
    bleacherreport: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
    nbcsports: 'https://images.unsplash.com/photo-1579403124614-197f69d8187b',
    skysports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2'
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
  
  // Try to find image URLs in different formats
  const patterns = [
    // Standard img tag
    /<img[^>]+src="([^">]+)"/,
    // Image URL in single quotes
    /<img[^>]+src='([^'>]+)'/,
    // Media content URL
    /<media:content[^>]+url="([^">]+)"/,
    // Media content URL in single quotes
    /<media:content[^>]+url='([^'>]+)'/,
    // Media thumbnail
    /<media:thumbnail[^>]+url="([^">]+)"/,
    // Media thumbnail in single quotes
    /<media:thumbnail[^>]+url='([^'>]+)'/,
    // Figure tag with image
    /<figure[^>]*>.*?<img[^>]+src="([^">]+)".*?<\/figure>/,
    // Data-src attribute (common in lazy-loaded images)
    /<img[^>]+data-src="([^">]+)"/,
    // Simple URL pattern
    /https?:\/\/[^"'\s>)]+\.(?:jpg|jpeg|png|gif|webp)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

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
      
      // Try multiple approaches to find the image
      
      // 1. Check media:content
      if (item['media:content']) {
        const mediaContent = Array.isArray(item['media:content']) 
          ? item['media:content'][0] 
          : item['media:content'];
        image = mediaContent?.["@_url"] || mediaContent?.url;
      }
      
      // 2. Check media:thumbnail
      if (!image && item['media:thumbnail']) {
        const mediaThumbnail = Array.isArray(item['media:thumbnail'])
          ? item['media:thumbnail'][0]
          : item['media:thumbnail'];
        image = mediaThumbnail?.["@_url"] || mediaThumbnail?.url;
      }
      
      // 3. Check enclosure
      if (!image && item.enclosure) {
        const enclosure = Array.isArray(item.enclosure)
          ? item.enclosure[0]
          : item.enclosure;
        if (enclosure?.["@_type"]?.startsWith('image/')) {
          image = enclosure?.["@_url"];
        }
      }
      
      // 4. Check image object
      if (!image && item.image) {
        image = item.image?.url || item.image?.["@_url"];
      }
      
      // 5. Check content:encoded or description for embedded images
      if (!image) {
        const contentEncoded = item['content:encoded'] || '';
        image = extractImageFromContent(contentEncoded);
      }
      
      if (!image) {
        const content = item.content || '';
        image = extractImageFromContent(content);
      }
      
      if (!image) {
        const description = item.description || '';
        image = extractImageFromContent(description);
      }

      // Only use default image if no valid image URL was found
      if (!image || !image.match(/^https?:\/\//)) {
        console.log(`No valid image found for article in ${categorySlug}, using default`);
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

    console.log(`Success: ${categorySlug} - ${articles.length} articles, with images:`, 
      articles.filter(a => a.image && !a.image.includes('unsplash.com')).length);
    return articles;

  } catch (error) {
    console.error(`Error fetching RSS feed for ${categorySlug}:`, error);
    return [];
  }
};
