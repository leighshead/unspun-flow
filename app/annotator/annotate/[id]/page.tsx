'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import AnnotationInterface from './AnnotationInterface'

export default function AnnotatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [article, setArticle] = useState<any>(null)
  const [sentences, setSentences] = useState<any[]>([])
  const [existingAnnotations, setExistingAnnotations] = useState<any[]>([])
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

      if (!profileData) {
        router.push('/login')
        return
      }

      setProfile(profileData)

      // Get article
      const { data: articleData } = await supabase
        .from('articles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!articleData) {
        router.push('/annotator/dashboard')
        return
      }

      setArticle(articleData)

      // Get sentences
      const { data: sentencesData } = await supabase
        .from('sentences')
        .select('*')
        .eq('article_id', params.id)
        .order('position', { ascending: true })

      setSentences(sentencesData || [])

      // Get existing annotations
      const sentenceIds = (sentencesData || []).map((s: any) => s.id)
      const { data: annotationsData } = await supabase
        .from('annotations')
        .select('*')
        .eq('annotator_id', user.id)
        .in('sentence_id', sentenceIds)

      setExistingAnnotations(annotationsData || [])
      setLoading(false)
    }

    loadData()
  }, [params.id, router, supabase])

  if (loading || !profile || !article) {
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
        <AnnotationInterface
          article={article}
          sentences={sentences}
          existingAnnotations={existingAnnotations}
          userId={profile.id}
        />
      </main>
    </div>
  )
}
