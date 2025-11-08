import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import Link from 'next/link'
import { FileText, PlayCircle } from 'lucide-react'

export default async function AnnotatorDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get assignments with article data
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      *,
      articles (
        id,
        title,
        source,
        status
      )
    `)
    .eq('annotator_id', user.id)
    .order('assigned_date', { ascending: false })

  // Get annotation counts for each assignment
  const assignmentsWithProgress = await Promise.all(
    (assignments || []).map(async (assignment: any) => {
      const { data: sentences } = await supabase
        .from('sentences')
        .select('id')
        .eq('article_id', assignment.article_id)

      const { data: annotations } = await supabase
        .from('annotations')
        .select('id')
        .eq('annotator_id', user.id)
        .in('sentence_id', (sentences || []).map((s: any) => s.id))

      return {
        ...assignment,
        total_sentences: sentences?.length || 0,
        completed_sentences: annotations?.length || 0,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={profile.name} userRole={profile.role} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">My Assignments</h1>

          {!assignmentsWithProgress || assignmentsWithProgress.length === 0 ? (
            <div className="card text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No Assignments Yet</h2>
              <p className="text-gray-600">
                You don't have any articles assigned to you at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignmentsWithProgress.map((assignment: any) => {
                const progress = assignment.total_sentences > 0
                  ? Math.round((assignment.completed_sentences / assignment.total_sentences) * 100)
                  : 0
                const isCompleted = assignment.status === 'completed'

                return (
                  <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {assignment.articles.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {assignment.articles.source} • Assigned{' '}
                          {new Date(assignment.assigned_date).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={assignment.status} />
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>
                          {assignment.completed_sentences} / {assignment.total_sentences} sentences
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/annotator/annotate/${assignment.article_id}`}
                      className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} w-full flex items-center justify-center gap-2`}
                    >
                      <PlayCircle size={20} />
                      {isCompleted ? 'Completed' : progress > 0 ? 'Continue' : 'Start Annotating'}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
