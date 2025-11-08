import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/shared/Layout';
import { useAnnotations } from '../hooks/useAnnotations';
import api from '../utils/api';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

const BIAS_TYPES = [
  { value: 'loaded_language', label: 'Loaded Language' },
  { value: 'framing', label: 'Framing' },
  { value: 'source_imbalance', label: 'Source Imbalance' },
  { value: 'speculation', label: 'Speculation/Unverified' },
  { value: 'omission', label: 'Omission' },
  { value: 'neutral', label: 'Neutral' },
];

const CONFIDENCE_LEVELS = ['high', 'medium', 'low'];

export const AnnotateArticle: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { createAnnotation } = useAnnotations();

  const [article, setArticle] = useState<any>(null);
  const [sentences, setSentences] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBias, setSelectedBias] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<string>('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/articles/${articleId}`);
      setArticle(response.data.article);
      setSentences(response.data.sentences);
    } catch (err) {
      console.error('Failed to fetch article:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentSentence = sentences[currentIndex];

  const handleToggleBias = (biasType: string) => {
    if (biasType === 'neutral') {
      setSelectedBias(['neutral']);
    } else {
      const filtered = selectedBias.filter((b) => b !== 'neutral');
      if (filtered.includes(biasType)) {
        setSelectedBias(filtered.filter((b) => b !== biasType));
      } else {
        setSelectedBias([...filtered, biasType]);
      }
    }
  };

  const handleSaveAndNext = async () => {
    if (selectedBias.length === 0) {
      alert('Please select at least one bias type');
      return;
    }

    try {
      await createAnnotation({
        sentenceId: currentSentence.id,
        biasTags: selectedBias,
        confidence,
        notes,
      });

      // Move to next sentence
      if (currentIndex < sentences.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedBias([]);
        setConfidence('medium');
        setNotes('');
      } else {
        alert('All sentences annotated!');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to save annotation:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">{article?.title}</h1>
          <p className="text-sm text-gray-600">
            {article?.source} • Progress: {currentIndex + 1} / {sentences.length}
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
            {currentSentence?.text}
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

          <button onClick={handleSaveAndNext} className="btn btn-primary flex items-center gap-2">
            <Save size={20} />
            {currentIndex < sentences.length - 1 ? 'Save & Next' : 'Save & Finish'}
            {currentIndex < sentences.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </Layout>
  );
};
