import { useState } from 'react';
import api from '../utils/api';

export const useAnnotations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnnotation = async (data: any) => {
    try {
      setLoading(true);
      const response = await api.post('/annotations', data);
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create annotation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkSaveAnnotations = async (annotations: any[]) => {
    try {
      setLoading(true);
      const response = await api.post('/annotations/bulk', { annotations });
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save annotations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSentenceAnnotations = async (sentenceId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/annotations/sentences/${sentenceId}`);
      setError(null);
      return response.data.annotations;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch annotations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getArticleAgreement = async (articleId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/annotations/articles/${articleId}/agreement`);
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch agreement');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createAnnotation,
    bulkSaveAnnotations,
    getSentenceAnnotations,
    getArticleAgreement,
  };
};
