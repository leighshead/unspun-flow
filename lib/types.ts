export type ArticleStatus =
  | 'queued'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'needs_review'
  | 'ready_to_publish'
  | 'published'

export type AssignmentStatus = 'pending' | 'in_progress' | 'completed'

export type AnnotatorStatus = 'active' | 'inactive'

export type BiasType =
  | 'loaded_language'
  | 'framing'
  | 'source_imbalance'
  | 'speculation'
  | 'omission'
  | 'neutral'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type UserRole = 'admin' | 'annotator'

export interface Article {
  id: string
  title: string
  url: string
  source: string
  publication_date: string
  ingestion_date: string
  raw_html?: string
  cleaned_text?: string
  metadata?: Record<string, any>
  status: ArticleStatus
  created_at: string
  updated_at: string
}

export interface Sentence {
  id: string
  article_id: string
  text: string
  position: number
  previous_sentence?: string
  next_sentence?: string
  created_at: string
}

export interface Profile {
  id: string
  name: string
  bio?: string
  role: UserRole
  status: AnnotatorStatus
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  article_id: string
  annotator_id: string
  assigned_date: string
  due_date?: string
  status: AssignmentStatus
  completed_date?: string
}

export interface Annotation {
  id: string
  sentence_id: string
  annotator_id: string
  bias_tags: BiasType[]
  confidence: ConfidenceLevel
  notes?: string
  created_at: string
  updated_at: string
}

export interface Discussion {
  id: string
  sentence_id: string
  annotator_id: string
  comment: string
  created_at: string
  resolved: boolean
}
