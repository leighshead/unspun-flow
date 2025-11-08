import nlp from 'compromise';

export const segmentIntoSentences = (text: string): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const doc = nlp(text);
  const sentences = doc.sentences().out('array');

  return sentences.filter(s => s.trim().length > 0);
};

export const cleanHtml = (html: string): string => {
  // Basic HTML cleaning - remove tags but keep content
  // In production, use a proper HTML parser
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};
