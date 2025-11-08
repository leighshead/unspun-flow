-- Initial database schema for Unspun Annotation System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  publication_date DATE NOT NULL,
  ingestion_date TIMESTAMP DEFAULT NOW(),
  raw_html TEXT,
  cleaned_text TEXT,
  metadata JSONB,
  status TEXT CHECK (status IN (
    'queued', 'assigned', 'in_progress',
    'completed', 'needs_review', 'ready_to_publish', 'published'
  )) DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_publication_date ON articles(publication_date);

-- Sentences table
CREATE TABLE sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position INTEGER NOT NULL,
  previous_sentence TEXT,
  next_sentence TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sentences_article ON sentences(article_id);
CREATE INDEX idx_sentences_position ON sentences(article_id, position);

-- Annotators table
CREATE TABLE annotators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  role TEXT CHECK (role IN ('admin', 'annotator')) DEFAULT 'annotator',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_annotators_email ON annotators(email);
CREATE INDEX idx_annotators_status ON annotators(status);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  annotator_id UUID REFERENCES annotators(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  status TEXT CHECK (status IN (
    'pending', 'in_progress', 'completed'
  )) DEFAULT 'pending',
  completed_date TIMESTAMP,
  UNIQUE(article_id, annotator_id)
);

CREATE INDEX idx_assignments_annotator ON assignments(annotator_id);
CREATE INDEX idx_assignments_article ON assignments(article_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Annotations table
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE,
  annotator_id UUID REFERENCES annotators(id) ON DELETE CASCADE,
  bias_tags TEXT[] DEFAULT '{}',
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(sentence_id, annotator_id)
);

CREATE INDEX idx_annotations_sentence ON annotations(sentence_id);
CREATE INDEX idx_annotations_annotator ON annotations(annotator_id);

-- Discussions table
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE,
  annotator_id UUID REFERENCES annotators(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_discussions_sentence ON discussions(sentence_id);
CREATE INDEX idx_discussions_resolved ON discussions(resolved);

-- Agreement scores table
CREATE TABLE agreement_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  annotator_a_id UUID REFERENCES annotators(id),
  annotator_b_id UUID REFERENCES annotators(id),
  total_sentences INTEGER NOT NULL,
  agreed_sentences INTEGER NOT NULL,
  agreement_percentage DECIMAL(5,2),
  calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agreement_article ON agreement_scores(article_id);

-- Claude API logs table
CREATE TABLE claude_api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature TEXT NOT NULL,
  article_id UUID REFERENCES articles(id),
  sentence_id UUID REFERENCES sentences(id),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_claude_logs_feature ON claude_api_logs(feature);
CREATE INDEX idx_claude_logs_created_at ON claude_api_logs(created_at);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotators_updated_at BEFORE UPDATE ON annotators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
