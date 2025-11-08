import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import AnnotationInterface from './AnnotationInterface'

export default async function AnnotatePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get article
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!article) redirect('/annotator/dashboard')

  // Get sentences
  const { data: sentences } = await supabase
    .from('sentences')
    .select('*')
    .eq('article_id', params.id)
    .order('position', { ascending: true })

  // Get existing annotations
  const { data: existingAnnotations } = await supabase
    .from('annotations')
    .select('*')
    .eq('annotator_id', user.id)
    .in('sentence_id', (sentences || []).map((s: any) => s.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={profile.name} userRole={profile.role} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnnotationInterface
          article={article}
          sentences={sentences || []}
          existingAnnotations={existingAnnotations || []}
          userId={user.id}
        />
      </main>
    </div>
  )
}
