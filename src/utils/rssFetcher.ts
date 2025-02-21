
import { XMLParser } from 'fast-xml-parser';
import { RSSArticle } from './types/rssTypes';
import { RSS_SOURCES } from './config/rssConfig';
import { findArticleImage, getDefaultImage } from './helpers/imageUtils';
import { decodeHTMLEntities, cleanDescription } from './helpers/textUtils';

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
      let image = findArticleImage(item);

      // Use default image if no valid image URL was found
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
        excerpt: cleanDescription(description),
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
