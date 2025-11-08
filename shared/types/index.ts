// Shared TypeScript types for frontend and backend

export type ArticleStatus =
  | 'queued'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'needs_review'
  | 'ready_to_publish'
  | 'published';

export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';

export type AnnotatorStatus = 'active' | 'inactive';

export type BiasType =
  | 'loaded_language'
  | 'framing'
  | 'source_imbalance'
  | 'speculation'
  | 'omission'
  | 'neutral';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type UserRole = 'admin' | 'annotator';

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publicationDate: Date;
  ingestionDate: Date;
  rawHtml?: string;
  cleanedText?: string;
  metadata?: Record<string, any>;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sentence {
  id: string;
  articleId: string;
  text: string;
  position: number;
  previousSentence?: string;
  nextSentence?: string;
  createdAt: Date;
}

export interface Annotator {
  id: string;
  name: string;
  email: string;
  bio?: string;
  status: AnnotatorStatus;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  articleId: string;
  annotatorId: string;
  assignedDate: Date;
  dueDate?: Date;
  status: AssignmentStatus;
  completedDate?: Date;
}

export interface Annotation {
  id: string;
  sentenceId: string;
  annotatorId: string;
  biasTags: BiasType[];
  confidence: ConfidenceLevel;
  notes?: string;
  timestamp: Date;
}

export interface Discussion {
  id: string;
  sentenceId: string;
  annotatorId: string;
  comment: string;
  createdAt: Date;
  resolved: boolean;
}

export interface AgreementScore {
  id: string;
  articleId: string;
  annotatorAId: string;
  annotatorBId: string;
  totalSentences: number;
  agreedSentences: number;
  agreementPercentage: number;
  calculatedAt: Date;
}

export interface ClaudeAPILog {
  id: string;
  feature: 'suggestion' | 'resolution' | 'card_generation' | 'quality_check';
  articleId?: string;
  sentenceId?: string;
  promptTokens: number;
  completionTokens: number;
  response: Record<string, any>;
  createdAt: Date;
}

// API Request/Response types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<Annotator, 'passwordHash'>;
}

export interface CreateArticleRequest {
  title: string;
  url: string;
  source: string;
  publicationDate: string;
  rawHtml?: string;
  content?: string;
}

export interface AssignAnnotatorsRequest {
  articleId: string;
  annotatorIds: [string, string]; // Exactly two annotators
  dueDate?: string;
}

export interface CreateAnnotationRequest {
  sentenceId: string;
  biasTags: BiasType[];
  confidence: ConfidenceLevel;
  notes?: string;
}

export interface BulkSaveAnnotationsRequest {
  annotations: CreateAnnotationRequest[];
}

export interface ClaudeSuggestionRequest {
  sentence: string;
  previousSentence?: string;
  nextSentence?: string;
}

export interface ClaudeSuggestionResponse {
  biasTypes: BiasType[];
  confidence: ConfidenceLevel;
  reasoning: string;
  keyPhrases: string[];
}

export interface ClaudeResolutionRequest {
  sentence: string;
  context?: string;
  annotatorA: {
    biasType: BiasType[];
    confidence: ConfidenceLevel;
    notes?: string;
  };
  annotatorB: {
    biasType: BiasType[];
    confidence: ConfidenceLevel;
    notes?: string;
  };
}

export interface ClaudeResolutionResponse {
  agreementWith: 'annotator_a' | 'annotator_b' | 'both_partially' | 'neither';
  recommendedClassification: BiasType[];
  reasoning: string;
  teachingPoint: string;
}

export interface DashboardStats {
  queued: number;
  inProgress: number;
  completed: number;
  readyToPublish: number;
  needsDiscussion: number;
}

export interface ArticleExport {
  articleMetadata: {
    articleId: string;
    title: string;
    url: string;
    source: string;
    publicationDate: string;
    ingestionDate: string;
    annotators: Array<{
      id: string;
      name: string;
      email: string;
    }>;
    annotationCompleted: string;
    overallAgreement: number;
    status: ArticleStatus;
  };
  sentences: Array<{
    sentenceId: string;
    text: string;
    position: number;
    context: {
      previous?: string;
      next?: string;
    };
    annotations: {
      annotatorA: {
        biasTags: BiasType[];
        confidence: ConfidenceLevel;
        notes?: string;
        timestamp: string;
      };
      annotatorB: {
        biasTags: BiasType[];
        confidence: ConfidenceLevel;
        notes?: string;
        timestamp: string;
      };
    };
    agreement: {
      agreed: boolean;
      discussionNeeded: boolean;
      resolved: boolean;
      resolutionNotes?: string;
    };
  }>;
  aggregatedScores: {
    totalSentences: number;
    biasCategories: {
      [key in BiasType]: {
        annotatorACount: number;
        annotatorBCount: number;
        agreedCount: number;
      };
    };
  };
}

export interface AnnotatorWithStats extends Annotator {
  totalArticles: number;
  averageAgreement: number;
  articlesPerWeek: number;
}

export interface ArticleWithAssignments extends Article {
  annotators?: Annotator[];
  progress?: {
    completed: number;
    total: number;
  };
  agreementScore?: number;
}

export interface SentenceWithAnnotations extends Sentence {
  annotations: Annotation[];
  discussions: Discussion[];
}
