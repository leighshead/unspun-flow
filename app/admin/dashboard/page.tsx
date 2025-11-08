'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import CreateArticleButton from './CreateArticleButton'
import { FileText } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [articles, setArticles] = useState<any[]>([])
  const [stats, setStats] = useState({
    queued: 0,
    in_progress: 0,
    completed: 0,
    ready_to_publish: 0,
    needs_discussion: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData?.role !== 'admin') {
        router.push('/annotator/dashboard')
        return
      }

      setProfile(profileData)

      // Get articles with sentence counts
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (articlesData) {
        // Get sentence counts for each article
        const articlesWithCounts = await Promise.all(
          articlesData.map(async (article) => {
            const { count } = await supabase
              .from('sentences')
              .select('*', { count: 'exact', head: true })
              .eq('article_id', article.id)

            return { ...article, sentence_count: count || 0 }
          })
        )
        setArticles(articlesWithCounts)
      }

      // Get stats
      const { data: statsData } = await supabase
        .from('articles')
        .select('status')

      if (statsData) {
        setStats({
          queued: statsData.filter(a => a.status === 'queued').length,
          in_progress: statsData.filter(a => a.status === 'in_progress' || a.status === 'assigned').length,
          completed: statsData.filter(a => a.status === 'completed').length,
          ready_to_publish: statsData.filter(a => a.status === 'ready_to_publish').length,
          needs_discussion: statsData.filter(a => a.status === 'needs_review').length,
        })
      }

      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={profile.name} userRole={profile.role} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <CreateArticleButton />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatsCard title="Queued" count={stats.queued} color="gray" />
            <StatsCard title="In Progress" count={stats.in_progress} color="yellow" />
            <StatsCard title="Completed" count={stats.completed} color="purple" />
            <StatsCard title="Ready to Publish" count={stats.ready_to_publish} color="green" />
            <StatsCard title="Needs Discussion" count={stats.needs_discussion} color="orange" />
          </div>

          {/* Articles Table */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Articles</h2>

            {articles.length === 0 ? (
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
                    {articles.map((article: any) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{article.title}</td>
                        <td className="px-4 py-3">{article.source}</td>
                        <td className="px-4 py-3">
                          {new Date(article.publication_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={article.status} />
                        </td>
                        <td className="px-4 py-3">{article.sentence_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatsCard({ title, count, color }: { title: string; count: number; color: string }) {
  const colorClasses: Record<string, string> = {
    gray: 'text-gray-800',
    yellow: 'text-yellow-800',
    purple: 'text-purple-800',
    green: 'text-green-800',
    orange: 'text-orange-800',
  }

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color] || 'text-gray-800'}`}>
        {count}
      </p>
    </div>
  )
}
