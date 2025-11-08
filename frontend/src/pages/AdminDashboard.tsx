import React, { useState, useEffect } from 'react';
import { Layout } from '../components/shared/Layout';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useArticles } from '../hooks/useArticles';
import api from '../utils/api';
import { Plus, FileText } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { articles, loading, fetchArticles } = useArticles();
  const [stats, setStats] = useState<any>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/articles/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Article
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatsCard title="Queued" count={stats.queued || 0} color="gray" />
          <StatsCard title="In Progress" count={stats.in_progress || 0} color="yellow" />
          <StatsCard title="Completed" count={stats.completed || 0} color="purple" />
          <StatsCard title="Ready to Publish" count={stats.ready_to_publish || 0} color="green" />
          <StatsCard title="Needs Discussion" count={stats.needs_discussion || 0} color="orange" />
        </div>

        {/* Articles Table */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Articles</h2>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-2 opacity-50" />
              <p>No articles yet. Add your first article to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Sentences</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{article.title}</td>
                      <td className="px-4 py-3">{article.source}</td>
                      <td className="px-4 py-3">
                        {new Date(article.publication_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="px-4 py-3">{article.sentence_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateArticleModal
          onClose={() => {
            setShowCreateModal(false);
            fetchArticles();
            fetchStats();
          }}
        />
      )}
    </Layout>
  );
};

const StatsCard: React.FC<{ title: string; count: number; color: string }> = ({
  title,
  count,
  color,
}) => {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]?.split(' ')[1] || 'text-gray-800'}`}>
        {count}
      </p>
    </div>
  );
};

const CreateArticleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    source: '',
    publicationDate: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/articles', formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Article</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
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
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Article'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
