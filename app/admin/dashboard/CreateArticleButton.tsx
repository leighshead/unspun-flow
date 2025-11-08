'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { segmentIntoSentences } from '@/lib/services/sentence-segmentation'

export default function CreateArticleButton() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    source: '',
    publicationDate: '',
    content: '',
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create article
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert({
          title: formData.title,
          url: formData.url,
          source: formData.source,
          publication_date: formData.publicationDate,
          cleaned_text: formData.content,
          status: 'queued',
        })
        .select()
        .single()

      if (articleError) throw articleError

      // Segment into sentences
      const sentences = segmentIntoSentences(formData.content)

      // Insert sentences
      const sentenceData = sentences.map((text, i) => ({
        article_id: article.id,
        text,
        position: i,
        previous_sentence: i > 0 ? sentences[i - 1] : null,
        next_sentence: i < sentences.length - 1 ? sentences[i + 1] : null,
      }))

      const { error: sentencesError } = await supabase
        .from('sentences')
        .insert(sentenceData)

      if (sentencesError) throw sentencesError

      setShowModal(false)
      setFormData({ title: '', url: '', source: '', publicationDate: '', content: '' })
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-primary flex items-center gap-2"
      >
        <Plus size={20} />
        Add Article
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <h2 className="text-2xl font-bold mb-4">Add New Article</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="input"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Publication Date</label>
                <input
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                  className="input"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Article Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input"
                  rows={10}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Creating...' : 'Create Article'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
