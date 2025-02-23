
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.4';

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

function decodeHTMLEntities(text: string): string {
  return text.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function cleanDescription(html: string): string {
  return html
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\[\s*&nbsp;\s*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findArticleImage(item: any): string | null {
  // Special handling for BBC feeds
  if (item['media:thumbnail']) {
    const mediaThumbnail = Array.isArray(item['media:thumbnail']) 
      ? item['media:thumbnail'][0] 
      : item['media:thumbnail'];
    
    const url = mediaThumbnail?.["@_url"];
    if (url) {
      // BBC images come with size suffixes like '/240/', replace with larger size
      return url.replace('/240/', '/800/');
    }
  }

  // Check for media:content
  if (item['media:content']) {
    const mediaContent = Array.isArray(item['media:content']) 
      ? item['media:content'][0] 
      : item['media:content'];
    const url = mediaContent?.["@_url"];
    if (url) return url;
  }

  // Check for enclosure
  if (item.enclosure && item.enclosure['@_url'] && item.enclosure['@_type']?.startsWith('image/')) {
    return item.enclosure['@_url'];
  }

  // Check for image tag in item
  if (item.image && item.image.url) {
    return item.image.url;
  }

  // Try to find first image in description
  const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  // Additional check for content:encoded
  const contentEncoded = item['content:encoded'] || '';
  const contentImgMatch = contentEncoded.match(/<img[^>]+src="([^">]+)"/);
  if (contentImgMatch && contentImgMatch[1]) {
    return contentImgMatch[1];
  }

  return null;
}

function getDefaultImage(category: string): string {
  const defaultImages: { [key: string]: string } = {
    "1": "https://images.unsplash.com/photo-1518770660439-4636190af475", // Tech
    "2": "https://images.unsplash.com/photo-1507668077129-56e32842fceb", // Science
    "3": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3", // Business
    "4": "https://images.unsplash.com/photo-1586899028174-e7098604235b", // Entertainment
    "5": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2", // World News
    "6": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620", // Politics
    "7": "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee", // US
    "8": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211", // Sports
    "9": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2", // World News
    "10": "https://images.unsplash.com/photo-1506126613408-eca07ce68773", // Lifestyle
  };

  return defaultImages[category] || defaultImages["1"];
}

export async function fetchRSSFeeds(url: string, categorySlug: string): Promise<RSSArticle[]> {
  try {
    console.log(`Fetching RSS feed for ${categorySlug}:`, url);
    const response = await fetch(url);
    
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
      let image = findArticleImage(item);

      if (!image || !image.match(/^https?:\/\//)) {
        console.log(`No valid image found for article in ${categorySlug}, using default`);
        image = getDefaultImage(categorySlug);
      } else {
        console.log(`Found image for article: ${image}`);
      }

      const title = decodeHTMLEntities(
        typeof item.title === 'string' ? item.title : item.title?.['#text'] || ''
      );
      
      const description = decodeHTMLEntities(
        typeof item.description === 'string' ? item.description : item.description?.['#text'] || ''
      );

      return {
        title,
        excerpt: cleanDescription(description),
        image,
        category: categorySlug,
        source: channel.title || categorySlug,
        date: new Date(item.pubDate || item.published || item['dc:date'] || '').toISOString(),
        author: item.author || item.creator || channel.title || 'Unknown',
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
}
