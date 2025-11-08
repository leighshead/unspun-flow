import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Article } from '@shared/types';

export const useArticles = (status?: string) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [status]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = status ? { status } : {};
      const response = await api.get('/articles', { params });
      setArticles(response.data.articles);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (data: any) => {
    const response = await api.post('/articles', data);
    await fetchArticles();
    return response.data;
  };

  const assignAnnotators = async (articleId: string, annotatorIds: string[], dueDate?: string) => {
    await api.post(`/articles/${articleId}/assign`, { annotatorIds, dueDate });
    await fetchArticles();
  };

  const deleteArticle = async (articleId: string) => {
    await api.delete(`/articles/${articleId}`);
    await fetchArticles();
  };

  return {
    articles,
    loading,
    error,
    fetchArticles,
    createArticle,
    assignAnnotators,
    deleteArticle,
  };
};
