-- Complete Second Brain Database Schema for a Fresh Supabase Project
-- This script will create all necessary tables, types, indexes, and RLS policies from scratch.
-- Please ensure your 'app.jwt_secret' is correctly set in your Supabase project settings.

-- Enable Row Level Security (if not already enabled)
ALTER DATABASE postgres SET "app.jwt_secret" TO 
  -- IMPORTANT: Replace 'your-jwt-secret' with your actual JWT secret from Supabase Project Settings -> API -> JWT Secret
  -- Example: 'super-secret-jwt-key-that-is-at-least-32-characters-long'
  'your-jwt-secret';

-- ================================
-- 1. CUSTOM TYPES
-- ================================

-- Drop types if they exist to allow recreation (useful for re-running script)
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS content_domain CASCADE;
DROP TYPE IF EXISTS complexity_level CASCADE;
DROP TYPE IF EXISTS action_density CASCADE;
DROP TYPE IF EXISTS processing_status CASCADE;
DROP TYPE IF EXISTS chunk_type CASCADE;

CREATE TYPE resource_type AS ENUM (
  'youtube', 'book', 'article', 'pdf', 'podcast', 'tweet', 'linkedin', 'website', 'document'
);
CREATE TYPE content_domain AS ENUM (
  'business', 'parenting', 'health', 'productivity', 'finance', 'technology', 'education', 'personal'
);
CREATE TYPE complexity_level AS ENUM (
  'beginner', 'intermediate', 'advanced', 'mixed'
);
CREATE TYPE action_density AS ENUM (
  'high', 'medium', 'low', 'none'
);
CREATE TYPE processing_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'archived'
);
CREATE TYPE chunk_type AS ENUM (
  'executive_summary', 'key_insights', 'actions', 'warnings', 'data', 'conclusion', 'mixed'
);

-- ================================
-- 2. CORE TABLES
-- ================================

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{
    "default_domain": "business",
    "preferred_chunk_size": 1000,
    "embedding_model": "gemini",
    "auto_process": true,
    "notification_settings": {
      "processing_complete": true,
      "weekly_digest": true
    }
  }',
  total_processed_content INTEGER DEFAULT 0,
  total_embeddings INTEGER DEFAULT 0,
  monthly_quota_used INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE public.spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  domain content_domain DEFAULT 'business',
  is_default BOOLEAN DEFAULT FALSE,
  content_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pinecone_namespace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classifications table
CREATE TABLE public.classifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.classifications(id),
  domain content_domain,
  usage_count INTEGER DEFAULT 0,
  is_system_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table (main content storage)
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type resource_type NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  domain content_domain NOT NULL DEFAULT 'business',
  complexity_level complexity_level DEFAULT 'intermediate',
  estimated_read_time_minutes INTEGER,
  word_count INTEGER,
  language TEXT DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  processing_status processing_status DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  action_density action_density DEFAULT 'medium',
  novelty_score INTEGER CHECK (novelty_score >= 1 AND novelty_score <= 10),
  practical_applicability TEXT CHECK (practical_applicability IN ('immediate', 'short-term', 'long-term')),
  space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  classification_id UUID REFERENCES public.classifications(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search queries table
CREATE TABLE public.search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  query_type TEXT DEFAULT 'semantic',
  results_count INTEGER DEFAULT 0,
  avg_relevance_score DECIMAL(4,3),
  clicked_results UUID[],
  extracted_intent TEXT,
  domain_classification content_domain,
  complexity_detected complexity_level,
  response_time_ms INTEGER,
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 3. REVOLUTIONARY RAG TABLES
-- ================================

-- Content summaries (structured RAG output)
CREATE TABLE public.content_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  executive_summary TEXT NOT NULL,
  key_insights TEXT,
  immediate_actions TEXT,
  critical_warnings TEXT,
  key_metrics JSONB DEFAULT '{}',
  tools_resources JSONB DEFAULT '{}',
  people_companies TEXT[],
  primary_keywords TEXT[],
  semantic_tags TEXT[],
  question_based_tags TEXT[],
  total_chunks INTEGER DEFAULT 0,
  embedding_model TEXT DEFAULT 'gemini',
  avg_chunk_tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector chunks (maps to Pinecone vectors)
CREATE TABLE public.vector_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  summary_id UUID REFERENCES public.content_summaries(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_type chunk_type NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  pinecone_id TEXT UNIQUE,
  pinecone_namespace TEXT,
  embedding_model TEXT DEFAULT 'gemini',
  vector_dimension INTEGER DEFAULT 768,
  parent_chunk_id UUID REFERENCES public.vector_chunks(id),
  overlapping_chunks UUID[],
  semantic_density DECIMAL(3,2),
  retrieval_frequency INTEGER DEFAULT 0,
  last_retrieved TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content relationships (cross-references)
CREATE TABLE public.content_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  target_resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  relationship_reason TEXT,
  is_auto_generated BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning analytics (track user behavior)
CREATE TABLE public.learning_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_details JSONB DEFAULT '{}',
  session_id TEXT,
  comprehension_level INTEGER CHECK (comprehension_level >= 1 AND comprehension_level <= 5),
  implementation_status TEXT CHECK (implementation_status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  device_type TEXT,
  time_spent_seconds INTEGER,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge graph nodes (advanced RAG feature)
CREATE TABLE public.knowledge_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  domain content_domain,
  importance_score INTEGER DEFAULT 1 CHECK (importance_score >= 1 AND importance_score <= 10),
  mention_frequency INTEGER DEFAULT 1,
  mentioned_in_resources UUID[],
  first_mentioned_date DATE DEFAULT CURRENT_DATE,
  last_mentioned_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge graph edges (relationships between concepts)
CREATE TABLE public.knowledge_edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL,
  strength DECIMAL(3,2) DEFAULT 0.5,
  evidence_resources UUID[],
  is_auto_generated BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 4. PERFORMANCE INDEXES
-- ================================

-- Indexes for core tables
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_spaces_user_id ON public.spaces(user_id);
CREATE INDEX idx_spaces_domain ON public.spaces(domain);
CREATE INDEX idx_classifications_code ON public.classifications(code);
CREATE INDEX idx_resources_user_id ON public.resources(user_id);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_domain ON public.resources(domain);
CREATE INDEX idx_resources_processing_status ON public.resources(processing_status);
CREATE INDEX idx_resources_space_id ON public.resources(space_id);
CREATE INDEX idx_resources_classification_id ON public.resources(classification_id);
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX idx_resources_title_search ON public.resources USING GIN(to_tsvector('english', title));
CREATE INDEX idx_resources_content_search ON public.resources USING GIN(to_tsvector('english', COALESCE(content, '')));
CREATE INDEX idx_search_queries_user_id ON public.search_queries(user_id);
CREATE INDEX idx_search_queries_domain ON public.search_queries(domain_classification);
CREATE INDEX idx_search_queries_created_at ON public.search_queries(created_at DESC);

-- Indexes for RAG-specific tables
CREATE INDEX idx_vector_chunks_resource_id ON public.vector_chunks(resource_id);
CREATE INDEX idx_vector_chunks_pinecone_id ON public.vector_chunks(pinecone_id);
CREATE INDEX idx_vector_chunks_namespace ON public.vector_chunks(pinecone_namespace);
CREATE INDEX idx_vector_chunks_type ON public.vector_chunks(chunk_type);
CREATE INDEX idx_vector_chunks_retrieval_freq ON public.vector_chunks(retrieval_frequency DESC);
CREATE INDEX idx_content_summaries_resource_id ON public.content_summaries(resource_id);
CREATE INDEX idx_content_summaries_keywords ON public.content_summaries USING GIN(primary_keywords);
CREATE INDEX idx_content_summaries_semantic_tags ON public.content_summaries USING GIN(semantic_tags);
CREATE INDEX idx_relationships_source ON public.content_relationships(source_resource_id);
CREATE INDEX idx_relationships_target ON public.content_relationships(target_resource_id);
CREATE INDEX idx_relationships_type ON public.content_relationships(relationship_type);
CREATE INDEX idx_learning_analytics_user_id ON public.learning_analytics(user_id);
CREATE INDEX idx_learning_analytics_resource_id ON public.learning_analytics(resource_id);
CREATE INDEX idx_learning_analytics_event_type ON public.learning_analytics(event_type);
CREATE INDEX idx_knowledge_nodes_type ON public.knowledge_nodes(type);
CREATE INDEX idx_knowledge_nodes_domain ON public.knowledge_nodes(domain);
CREATE INDEX idx_knowledge_nodes_importance ON public.knowledge_nodes(importance_score DESC);

-- ================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_edges ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Spaces policies
CREATE POLICY "Users can view own spaces" ON public.spaces
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spaces" ON public.spaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own spaces" ON public.spaces
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own spaces" ON public.spaces
  FOR DELETE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Users can view own resources" ON public.resources
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON public.resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON public.resources
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON public.resources
  FOR DELETE USING (auth.uid() = user_id);

-- Content summaries policies (inherit from resources)
CREATE POLICY "Users can view own summaries" ON public.content_summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_summaries.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own summaries" ON public.content_summaries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_summaries.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own summaries" ON public.content_summaries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_summaries.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own summaries" ON public.content_summaries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_summaries.resource_id 
      AND r.user_id = auth.uid()
    )
  );

-- Vector chunks policies (inherit from resources)
CREATE POLICY "Users can view own vector chunks" ON public.vector_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own vector chunks" ON public.vector_chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own vector chunks" ON public.vector_chunks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own vector chunks" ON public.vector_chunks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );

-- Content relationships policies (inherit from resources)
CREATE POLICY "Users can view own content relationships" ON public.content_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_relationships.source_resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own content relationships" ON public.content_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_relationships.source_resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own content relationships" ON public.content_relationships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_relationships.source_resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own content relationships" ON public.content_relationships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_relationships.source_resource_id 
      AND r.user_id = auth.uid()
    )
  );

-- Search queries policies
CREATE POLICY "Users can view own search queries" ON public.search_queries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search queries" ON public.search_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning analytics policies
CREATE POLICY "Users can view own learning analytics" ON public.learning_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning analytics" ON public.learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Knowledge nodes policies (viewable by all authenticated users, but managed by system/admin)
CREATE POLICY "Authenticated users can view knowledge nodes" ON public.knowledge_nodes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Knowledge edges policies (viewable by all authenticated users, but managed by system/admin)
CREATE POLICY "Authenticated users can view knowledge edges" ON public.knowledge_edges
  FOR SELECT USING (auth.role() = 'authenticated');

-- Classifications policies (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view classifications" ON public.classifications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Add any other necessary RLS policies for new columns or specific use cases here


