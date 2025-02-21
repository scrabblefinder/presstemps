
export const decodeHTMLEntities = (text: string): string => {
  if (!text) return '';
  
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.documentElement.textContent || '';
};

export const cleanDescription = (description: string): string => {
  if (!description) return '';
  const decodedText = decodeHTMLEntities(description);
  return decodedText.replace(/<[^>]+>/g, '').slice(0, 150) + '...';
};
