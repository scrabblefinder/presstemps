
export const findArticleImage = (item: any): string | null => {
  let image = null;
  
  if (item['media:content']) {
    const mediaContent = Array.isArray(item['media:content']) 
      ? item['media:content'][0] 
      : item['media:content'];
    image = mediaContent?.["@_url"] || mediaContent?.url;
  }
  
  if (!image && item['media:thumbnail']) {
    const mediaThumbnail = Array.isArray(item['media:thumbnail'])
      ? item['media:thumbnail'][0]
      : item['media:thumbnail'];
    image = mediaThumbnail?.["@_url"] || mediaThumbnail?.url;
  }
  
  if (!image && item.enclosure) {
    const enclosure = Array.isArray(item.enclosure)
      ? item.enclosure[0]
      : item.enclosure;
    if (enclosure?.["@_type"]?.startsWith('image/')) {
      image = enclosure?.["@_url"];
    }
  }
  
  if (!image && item.image) {
    image = item.image?.url || item.image?.["@_url"];
  }
  
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

export const extractImageFromContent = (content: string): string | null => {
  if (!content) return null;
  
  const patterns = [
    /<img[^>]+src="([^">]+)"/,
    /<img[^>]+src='([^'>]+)'/,
    /<media:content[^>]+url="([^">]+)"/,
    /<media:content[^>]+url='([^'>]+)'/,
    /<media:thumbnail[^>]+url="([^">]+)"/,
    /<media:thumbnail[^>]+url='([^'>]+)'/,
    /<figure[^>]*>.*?<img[^>]+src="([^">]+)".*?<\/figure>/,
    /<img[^>]+data-src="([^">]+)"/,
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

export const decodeHTMLEntities = (text: string): string => {
  return text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&nbsp;/g, ' ');
};

export const cleanDescription = (text: string): string => {
  return text.replace(/<[^>]+>/g, '').slice(0, 150) + '...';
};
