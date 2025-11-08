import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/shared/Layout';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { FileText, PlayCircle } from 'lucide-react';

export const AnnotatorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/annotators/${user!.id}/assignments`);
      setAssignments(response.data.assignments);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (assignment: any) => {
    const completed = assignment.completed_sentences || 0;
    const total = assignment.total_sentences || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Assignments</h1>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Assignments Yet</h2>
            <p className="text-gray-600">
              You don't have any articles assigned to you at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => {
              const progress = getProgress(assignment);
              const isCompleted = assignment.status === 'completed';

              return (
                <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">
                        {assignment.source} • Assigned{' '}
                        {new Date(assignment.assigned_date).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {assignment.completed_sentences || 0} / {assignment.total_sentences || 0}{' '}
                        sentences
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/annotate/${assignment.article_id}`)}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                    disabled={isCompleted}
                  >
                    <PlayCircle size={20} />
                    {isCompleted ? 'Completed' : progress > 0 ? 'Continue' : 'Start Annotating'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
