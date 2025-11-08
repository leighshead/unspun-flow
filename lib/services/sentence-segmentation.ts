import nlp from 'compromise'

export function segmentIntoSentences(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const doc = nlp(text)
  const sentences = doc.sentences().out('array') as string[]

  return sentences.filter(s => s.trim().length > 0)
}

export function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
