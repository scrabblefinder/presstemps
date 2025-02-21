
export const decodeHTMLEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export const cleanDescription = (description: string): string => {
  return description.replace(/<[^>]+>/g, '').slice(0, 150) + '...';
};
