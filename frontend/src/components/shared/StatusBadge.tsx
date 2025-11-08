import React from 'react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  needs_review: 'bg-orange-100 text-orange-800',
  ready_to_publish: 'bg-green-100 text-green-800',
  published: 'bg-green-100 text-green-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={clsx('badge', statusColors[status] || 'bg-gray-100 text-gray-800')}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};
