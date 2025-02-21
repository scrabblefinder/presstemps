
import { DEFAULT_IMAGES, DEFAULT_FALLBACK_IMAGE } from '../config/rssConfig';

export const extractImageFromContent = (content: string | undefined): string | null => {
  if (!content || typeof content !== 'string') return null;
  
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
    // Data-src attribute
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

export const getDefaultImage = (category: string): string => {
  return DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES] || DEFAULT_FALLBACK_IMAGE;
};

export const findArticleImage = (item: any): string | null => {
  let image = null;
  
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
  
  // 5. Check content:encoded or description
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

  return image;
};
