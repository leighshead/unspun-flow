'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import type { Article, Sentence, Annotation, BiasType, ConfidenceLevel } from '@/lib/types'

const BIAS_TYPES = [
  { value: 'loaded_language' as BiasType, label: 'Loaded Language' },
  { value: 'framing' as BiasType, label: 'Framing' },
  { value: 'source_imbalance' as BiasType, label: 'Source Imbalance' },
  { value: 'speculation' as BiasType, label: 'Speculation/Unverified' },
  { value: 'omission' as BiasType, label: 'Omission' },
  { value: 'neutral' as BiasType, label: 'Neutral' },
]

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low']

export default function AnnotationInterface({
  article,
  sentences,
  existingAnnotations,
  userId,
}: {
  article: Article
  sentences: Sentence[]
  existingAnnotations: Annotation[]
  userId: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedBias, setSelectedBias] = useState<BiasType[]>([])
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const currentSentence = sentences[currentIndex]

  // Load existing annotation if available
  useEffect(() => {
    if (currentSentence) {
      const existing = existingAnnotations.find(a => a.sentence_id === currentSentence.id)
      if (existing) {
        setSelectedBias(existing.bias_tags)
        setConfidence(existing.confidence)
        setNotes(existing.notes || '')
      } else {
        setSelectedBias([])
        setConfidence('medium')
        setNotes('')
      }
    }
  }, [currentIndex, currentSentence, existingAnnotations])

  const handleToggleBias = (biasType: BiasType) => {
    if (biasType === 'neutral') {
      setSelectedBias(['neutral'])
    } else {
      const filtered = selectedBias.filter(b => b !== 'neutral')
      if (filtered.includes(biasType)) {
        setSelectedBias(filtered.filter(b => b !== biasType))
      } else {
        setSelectedBias([...filtered, biasType])
      }
    }
  }

  const handleSaveAndNext = async () => {
    if (selectedBias.length === 0) {
      alert('Please select at least one bias type')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('annotations')
        .upsert({
          sentence_id: currentSentence.id,
          annotator_id: userId,
          bias_tags: selectedBias,
          confidence,
          notes: notes || null,
        })

      if (error) throw error

      // Move to next sentence
      if (currentIndex < sentences.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        alert('All sentences annotated!')
        router.push('/annotator/dashboard')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!currentSentence) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
        <p className="text-sm text-gray-600">
          {article.source} • Progress: {currentIndex + 1} / {sentences.length}
        </p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Sentence Display */}
      <div className="card">
        {currentIndex > 0 && (
          <p className="text-gray-400 italic mb-4">{sentences[currentIndex - 1]?.text}</p>
        )}

        <p className="text-xl font-medium mb-4 p-4 bg-blue-50 rounded-lg">
          {currentSentence.text}
        </p>

        {currentIndex < sentences.length - 1 && (
          <p className="text-gray-400 italic">{sentences[currentIndex + 1]?.text}</p>
        )}
      </div>

      {/* Annotation Controls */}
      <div className="card">
        <h3 className="font-semibold mb-3">Bias Type Selection:</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {BIAS_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleToggleBias(type.value)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedBias.includes(type.value)
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <h3 className="font-semibold mb-3">Confidence Level:</h3>
        <div className="flex gap-3 mb-6">
          {CONFIDENCE_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setConfidence(level)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                confidence === level
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <h3 className="font-semibold mb-3">Notes (Optional):</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
          rows={3}
          placeholder="Add any notes about this annotation..."
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          onClick={handleSaveAndNext}
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save size={20} />
          {loading ? 'Saving...' : currentIndex < sentences.length - 1 ? 'Save & Next' : 'Save & Finish'}
          {!loading && currentIndex < sentences.length - 1 && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  )
}
