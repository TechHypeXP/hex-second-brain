-- 10x Enhanced Second Brain Database Schema for Supabase + Pinecone RAG
-- Built upon Manas.im foundation with advanced RAG capabilities
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ================================
-- ENHANCED CUSTOM TYPES
-- ================================
CREATE TYPE resource_type AS ENUM ('youtube', 'book', 'article', 'pdf', 'podcast', 'tweet', 'linkedin', 'website', 'document');
CREATE TYPE content_domain AS ENUM ('business', 'parenting', 'health', 'productivity', 'finance', 'technology', 'education', 'personal');
CREATE TYPE complexity_level AS ENUM ('beginner', 'intermediate', 'advanced', 'mixed');
CREATE TYPE action_density AS ENUM ('high', 'medium', 'low', 'none');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'archived');
CREATE TYPE chunk_type AS ENUM ('executive_summary', 'key_insights', 'actions', 'warnings', 'data', 'conclusion', 'mixed');

-- ================================
-- ORIGINAL TABLES (Enhanced)
-- ================================

-- Enhanced user profiles with RAG preferences
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
  -- RAG-specific user settings
  total_processed_content INTEGER DEFAULT 0,
  total_embeddings INTEGER DEFAULT 0,
  monthly_quota_used INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced spaces with domain classification
CREATE TABLE public.spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  -- Enhanced space metadata
  domain content_domain DEFAULT 'business',
  is_default BOOLEAN DEFAULT FALSE,
  content_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pinecone_namespace TEXT, -- Maps to Pinecone namespace
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced classifications with hierarchical structure
CREATE TABLE public.classifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.classifications(id),
  -- Enhanced classification metadata
  domain content_domain,
  usage_count INTEGER DEFAULT 0,
  is_system_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- REVOLUTIONARY RAG TABLES
-- ================================

-- Enhanced resources table (main content storage)
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type resource_type NOT NULL,
  content TEXT, -- Raw content
  tags TEXT[] DEFAULT '{}',
  
  -- Enhanced metadata for RAG
  domain content_domain NOT NULL DEFAULT 'business',
  complexity_level complexity_level DEFAULT 'intermediate',
  estimated_read_time_minutes INTEGER,
  word_count INTEGER,
  language TEXT DEFAULT 'en',
  
  -- Content-specific metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}', -- Store video duration, author, publish_date, etc.
  
  -- Processing status
  processing_status processing_status DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Quality metrics
  action_density action_density DEFAULT 'medium',
  novelty_score INTEGER CHECK (novelty_score >= 1 AND novelty_score <= 10),
  practical_applicability TEXT CHECK (practical_applicability IN ('immediate', 'short-term', 'long-term')),
  
  -- Relationships
  space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  classification_id UUID REFERENCES public.classifications(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content summaries (structured RAG output)
CREATE TABLE public.content_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  
  -- Core summary sections
  executive_summary TEXT NOT NULL, -- 200-300 words, action-focused
  key_insights TEXT, -- 300-400 words, mental models
  immediate_actions TEXT, -- Specific, implementable actions
  critical_warnings TEXT, -- What NOT to do
  
  -- Structured data extraction
  key_metrics JSONB DEFAULT '{}', -- Statistics, figures, benchmarks
  tools_resources JSONB DEFAULT '{}', -- Software, books, links mentioned
  people_companies TEXT[], -- Names mentioned
  
  -- Search optimization
  primary_keywords TEXT[],
  semantic_tags TEXT[],
  question_based_tags TEXT[], -- What questions this answers
  
  -- RAG metadata
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
  
  -- Chunk metadata
  chunk_index INTEGER NOT NULL, -- Order within resource
  chunk_type chunk_type NOT NULL,
  content TEXT NOT NULL, -- The actual chunk content
  token_count INTEGER NOT NULL,
  
  -- Pinecone integration
  pinecone_id TEXT UNIQUE, -- Pinecone vector ID
  pinecone_namespace TEXT, -- Organized by domain/space
  embedding_model TEXT DEFAULT 'gemini',
  vector_dimension INTEGER DEFAULT 768,
  
  -- Chunk relationships
  parent_chunk_id UUID REFERENCES public.vector_chunks(id),
  overlapping_chunks UUID[], -- IDs of overlapping chunks
  
  -- Quality metrics
  semantic_density DECIMAL(3,2), -- How information-dense this chunk is
  retrieval_frequency INTEGER DEFAULT 0, -- How often retrieved
  last_retrieved TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content relationships (cross-references)
CREATE TABLE public.content_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  target_resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  
  -- Relationship metadata
  relationship_type TEXT NOT NULL, -- 'prerequisite', 'follow_up', 'contradicts', 'supports', 'similar'
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- How confident we are in this relationship
  relationship_reason TEXT, -- Why these are related
  
  -- Auto-generated or manual
  is_auto_generated BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced search queries with RAG analytics
CREATE TABLE public.search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  query_type TEXT DEFAULT 'semantic', -- 'keyword', 'semantic', 'hybrid'
  
  -- Results metadata
  results_count INTEGER DEFAULT 0,
  avg_relevance_score DECIMAL(4,3),
  clicked_results UUID[], -- Which results were clicked
  
  -- Query analysis
  extracted_intent TEXT, -- What the user was trying to find
  domain_classification content_domain,
  complexity_detected complexity_level,
  
  -- Performance tracking
  response_time_ms INTEGER,
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning analytics (track user behavior)
CREATE TABLE public.learning_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  
  -- Interaction tracking
  event_type TEXT NOT NULL, -- 'viewed', 'bookmarked', 'acted_on', 'shared', 'rated'
  event_details JSONB DEFAULT '{}',
  session_id TEXT,
  
  -- Learning progress
  comprehension_level INTEGER CHECK (comprehension_level >= 1 AND comprehension_level <= 5),
  implementation_status TEXT CHECK (implementation_status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  
  -- Context
  device_type TEXT,
  time_spent_seconds INTEGER,
  referral_source TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge graph nodes (advanced RAG feature)
CREATE TABLE public.knowledge_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Node identity
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'concept', 'person', 'company', 'tool', 'methodology'
  description TEXT,
  
  -- Node metadata
  domain content_domain,
  importance_score INTEGER DEFAULT 1 CHECK (importance_score >= 1 AND importance_score <= 10),
  mention_frequency INTEGER DEFAULT 1,
  
  -- Relationships to content
  mentioned_in_resources UUID[], -- Array of resource IDs
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
  
  -- Edge metadata
  relationship_type TEXT NOT NULL, -- 'depends_on', 'part_of', 'similar_to', 'contradicts', 'enables'
  strength DECIMAL(3,2) DEFAULT 0.5, -- Relationship strength 0.0-1.0
  evidence_resources UUID[], -- Resources that support this relationship
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PERFORMANCE INDEXES
-- ================================

-- Original indexes (enhanced)
CREATE INDEX idx_resources_user_id ON public.resources(user_id);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_domain ON public.resources(domain);
CREATE INDEX idx_resources_processing_status ON public.resources(processing_status);
CREATE INDEX idx_resources_space_id ON public.resources(space_id);
CREATE INDEX idx_resources_classification_id ON public.resources(classification_id);
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX idx_resources_title_search ON public.resources USING GIN(to_tsvector('english', title));
CREATE INDEX idx_resources_content_search ON public.resources USING GIN(to_tsvector('english', COALESCE(content, '')));

-- RAG-specific indexes
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

CREATE INDEX idx_search_queries_user_id ON public.search_queries(user_id);
CREATE INDEX idx_search_queries_domain ON public.search_queries(domain_classification);
CREATE INDEX idx_search_queries_created_at ON public.search_queries(created_at DESC);

CREATE INDEX idx_learning_analytics_user_id ON public.learning_analytics(user_id);
CREATE INDEX idx_learning_analytics_resource_id ON public.learning_analytics(resource_id);
CREATE INDEX idx_learning_analytics_event_type ON public.learning_analytics(event_type);

CREATE INDEX idx_knowledge_nodes_type ON public.knowledge_nodes(type);
CREATE INDEX idx_knowledge_nodes_domain ON public.knowledge_nodes(domain);
CREATE INDEX idx_knowledge_nodes_importance ON public.knowledge_nodes(importance_score DESC);

CREATE INDEX idx_spaces_user_id ON public.spaces(user_id);
CREATE INDEX idx_spaces_domain ON public.spaces(domain);

-- ================================
-- ENHANCED ROW LEVEL SECURITY
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
CREATE POLICY "Users can view own chunks" ON public.vector_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own chunks" ON public.vector_chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own chunks" ON public.vector_chunks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own chunks" ON public.vector_chunks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = vector_chunks.resource_id 
      AND r.user_id = auth.uid()
    )
  );

-- Other policies (simplified for brevity - follow same pattern)
CREATE POLICY "Users can manage own relationships" ON public.content_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.resources r 
      WHERE r.id = content_relationships.source_resource_id 
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own searches" ON public.search_queries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own searches" ON public.search_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON public.learning_analytics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own knowledge nodes" ON public.knowledge_nodes
  FOR ALL USING (true); -- Knowledge nodes can be shared across users

CREATE POLICY "Users can view knowledge edges" ON public.knowledge_edges
  FOR SELECT USING (true);

-- Classifications remain public
CREATE POLICY "Anyone can view classifications" ON public.classifications
  FOR SELECT USING (true);

-- ================================
-- ENHANCED FUNCTIONS & TRIGGERS
-- ================================

-- Updated timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_summaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.vector_chunks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to update space content count
CREATE OR REPLACE FUNCTION public.update_space_content_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.spaces 
    SET content_count = content_count + 1,
        last_accessed = NOW()
    WHERE id = NEW.space_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.spaces 
    SET content_count = GREATEST(content_count - 1, 0)
    WHERE id = OLD.space_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_space_content_count_trigger
  AFTER INSERT OR DELETE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_space_content_count();

-- Function to update user totals
CREATE OR REPLACE FUNCTION public.update_user_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_profiles 
    SET total_processed_content = total_processed_content + 1,
        last_active_date = CURRENT_DATE
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_profiles 
    SET total_processed_content = GREATEST(total_processed_content - 1, 0)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_totals_trigger
  AFTER INSERT OR DELETE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_user_totals();

-- ================================
-- ENHANCED SEARCH FUNCTIONS
-- ================================

-- Advanced hybrid search (combines semantic + keyword)
CREATE OR REPLACE FUNCTION public.hybrid_search_resources(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL,
  search_domain content_domain DEFAULT NULL,
  limit_results INTEGER DEFAULT 20,
  include_embeddings BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  url TEXT,
  type resource_type,
  tags TEXT[],
  domain content_domain,
  space_name TEXT,
  classification_name TEXT,
  summary_preview TEXT,
  keyword_rank REAL,
  semantic_tags TEXT[],
  action_density action_density,
  novelty_score INTEGER,
  total_chunks INTEGER,
  last_accessed TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.url,
    r.type,
    r.tags,
    r.domain,
    s.name as space_name,
    c.name as classification_name,
    LEFT(cs.executive_summary, 200) || '...' as summary_preview,
    ts_rank(
      to_tsvector('english', r.title || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.content, '')),
      plainto_tsquery('english', search_query)
    ) as keyword_rank,
    cs.semantic_tags,
    r.action_density,
    r.novelty_score,
    cs.total_chunks,
    s.last_accessed
  FROM public.resources r
  LEFT JOIN public.spaces s ON r.space_id = s.id
  LEFT JOIN public.classifications c ON r.classification_id = c.id
  LEFT JOIN public.content_summaries cs ON r.id = cs.resource_id
  WHERE 
    (user_uuid IS NULL OR r.user_id = user_uuid)
    AND (search_domain IS NULL OR r.domain = search_domain)
    AND r.processing_status = 'completed'
    AND (
      -- Keyword search
      to_tsvector('english', r.title || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.content, ''))
      @@ plainto_tsquery('english', search_query)
      -- Tag search
      OR r.tags && ARRAY[search_query]
      -- Semantic tag search
      OR (cs.semantic_tags IS NOT NULL AND cs.semantic_tags && ARRAY[search_query])
      -- Question-based search
      OR (cs.question_based_tags IS NOT NULL AND cs.question_based_tags && ARRAY[search_query])
    )
  ORDER BY 
    keyword_rank DESC,
    r.novelty_score DESC NULLS LAST,
    r.created_at DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related content based on knowledge graph
CREATE OR REPLACE FUNCTION public.get_related_content(
  resource_uuid UUID,
  user_uuid UUID,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  relationship_type TEXT,
  confidence_score DECIMAL,
  summary_preview TEXT,
  domain content_domain
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    r.id,
    r.title,
    cr.relationship_type,
    cr.confidence_score,
    LEFT(cs.executive_summary, 150) || '...' as summary_preview,
    r.domain
  FROM public.content_relationships cr
  JOIN public.resources r ON (
    CASE 
      WHEN cr.source_resource_id = resource_uuid THEN r.id = cr.target_resource_id
      ELSE r.id = cr.source_resource_id
    END
  )
  LEFT JOIN public.content_summaries cs ON r.id = cs.resource_id
  WHERE 
    (cr.source_resource_id = resource_uuid OR cr.target_resource_id = resource_uuid)
    AND r.user_id = user_uuid
    AND r.processing_status = 'completed'
    AND r.id != resource_uuid
  ORDER BY 
    cr.confidence_score DESC,
    r.created_at DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get learning recommendations
CREATE OR REPLACE FUNCTION public.get_learning_recommendations(
  user_uuid UUID,
  target_domain content_domain DEFAULT NULL,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  domain content_domain,
  action_density action_density,
  novelty_score INTEGER,
  estimated_read_time INTEGER,
  recommendation_reason TEXT,
  confidence_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    -- Analyze user's consumption patterns
    SELECT 
      la.resource_id,
      AVG(la.comprehension_level) as avg_comprehension,
      COUNT(*) as interaction_count,
      r.domain,
      r.action_density,
      r.complexity_level
    FROM public.learning_analytics la
    JOIN public.resources r ON la.resource_id = r.id
    WHERE la.user_id = user_uuid
      AND la.event_type IN ('viewed', 'bookmarked', 'acted_on')
      AND la.created_at > NOW() - INTERVAL '30 days'
    GROUP BY la.resource_id, r.domain, r.action_density, r.complexity_level
  ),
  similar_users AS (
    -- Find users with similar preferences (collaborative filtering)
    SELECT DISTINCT la2.user_id, COUNT(*) as similarity_score
    FROM user_preferences up
    JOIN public.learning_analytics la2 ON la2.resource_id = up.resource_id
    WHERE la2.user_id != user_uuid
      AND la2.event_type IN ('viewed', 'bookmarked', 'acted_on')
    GROUP BY la2.user_id
    HAVING COUNT(*) >= 3
    ORDER BY similarity_score DESC
    LIMIT 50
  )
  SELECT 
    r.id,
    r.title,
    r.domain,
    r.action_density,
    r.novelty_score,
    r.estimated_read_time_minutes,
    CASE 
      WHEN su.user_id IS NOT NULL THEN 'Users with similar interests found this valuable'
      WHEN r.domain = (SELECT domain FROM user_preferences GROUP BY domain ORDER BY COUNT(*) DESC LIMIT 1) 
        THEN 'Matches your most-consumed domain'
      WHEN r.action_density = 'high' THEN 'High actionability - immediate value'
      ELSE 'Recommended based on your learning patterns'
    END as recommendation_reason,
    CASE 
      WHEN su.similarity_score IS NOT NULL THEN su.similarity_score::DECIMAL / 100
      WHEN r.novelty_score >= 8 THEN 0.9
      WHEN r.action_density = 'high' THEN 0.8
      ELSE 0.6
    END as confidence_score
  FROM public.resources r
  LEFT JOIN similar_users su ON EXISTS (
    SELECT 1 FROM public.learning_analytics la3 
    WHERE la3.user_id = su.user_id 
      AND la3.resource_id = r.id
      AND la3.event_type IN ('bookmarked', 'acted_on')
  )
  WHERE r.user_id = user_uuid
    AND r.processing_status = 'completed'
    AND (target_domain IS NULL OR r.domain = target_domain)
    AND r.id NOT IN (
      SELECT resource_id FROM public.learning_analytics 
      WHERE user_id = user_uuid 
        AND event_type IN ('viewed', 'bookmarked')
        AND created_at > NOW() - INTERVAL '7 days'
    )
  ORDER BY confidence_score DESC, r.novelty_score DESC NULLS LAST
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- ENHANCED DEFAULT DATA
-- ================================

-- Enhanced classifications with domain mapping
INSERT INTO public.classifications (name, code, description, domain, is_system_default) VALUES
-- Business & Productivity
('Business Strategy', 'BIZ001', 'Strategic planning, competitive analysis, market positioning', 'business',