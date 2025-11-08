-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE article_status AS ENUM ('queued', 'assigned', 'in_progress', 'completed', 'needs_review', 'ready_to_publish', 'published');
CREATE TYPE assignment_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE annotator_status AS ENUM ('active', 'inactive');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE user_role AS ENUM ('admin', 'annotator');

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  publication_date DATE NOT NULL,
  ingestion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_html TEXT,
  cleaned_text TEXT,
  metadata JSONB DEFAULT '{}',
  status article_status DEFAULT 'queued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_source ON articles(source);

-- Sentences table
CREATE TABLE sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  position INTEGER NOT NULL,
  previous_sentence TEXT,
  next_sentence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sentences_article ON sentences(article_id);

-- Extend auth.users with profile data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  role user_role DEFAULT 'annotator',
  status annotator_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  annotator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  status assignment_status DEFAULT 'pending',
  completed_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(article_id, annotator_id)
);

CREATE INDEX idx_assignments_annotator ON assignments(annotator_id);
CREATE INDEX idx_assignments_article ON assignments(article_id);

-- Annotations table
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE NOT NULL,
  annotator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bias_tags TEXT[] DEFAULT '{}',
  confidence confidence_level,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sentence_id, annotator_id)
);

CREATE INDEX idx_annotations_sentence ON annotations(sentence_id);
CREATE INDEX idx_annotations_annotator ON annotations(annotator_id);

-- Discussions table
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE NOT NULL,
  annotator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_discussions_sentence ON discussions(sentence_id);

-- Agreement scores table
CREATE TABLE agreement_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  annotator_a_id UUID REFERENCES profiles(id) NOT NULL,
  annotator_b_id UUID REFERENCES profiles(id) NOT NULL,
  total_sentences INTEGER NOT NULL,
  agreed_sentences INTEGER NOT NULL,
  agreement_percentage DECIMAL(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_scores ENABLE ROW LEVEL SECURITY;

-- Articles policies
CREATE POLICY "Articles are viewable by all authenticated users" ON articles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Articles are creatable by admins" ON articles
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Articles are updatable by admins" ON articles
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Sentences policies
CREATE POLICY "Sentences are viewable by all authenticated users" ON sentences
  FOR SELECT TO authenticated USING (true);

-- Profiles policies
CREATE POLICY "Profiles are viewable by all authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Assignments policies
CREATE POLICY "Assignments are viewable by assigned annotators and admins" ON assignments
  FOR SELECT TO authenticated USING (
    annotator_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Annotations policies
CREATE POLICY "Annotations are viewable by all authenticated users" ON annotations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own annotations" ON annotations
  FOR INSERT TO authenticated WITH CHECK (annotator_id = auth.uid());

CREATE POLICY "Users can update own annotations" ON annotations
  FOR UPDATE TO authenticated USING (annotator_id = auth.uid());

-- Discussions policies
CREATE POLICY "Discussions are viewable by all authenticated users" ON discussions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create discussions" ON discussions
  FOR INSERT TO authenticated WITH CHECK (annotator_id = auth.uid());
