-- Second Brain Database Schema for Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE resource_type AS ENUM ('youtube', 'book', 'article');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE public.spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classifications table (Library of Congress inspired)
CREATE TABLE public.classifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.classifications(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type resource_type NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  classification_id UUID REFERENCES public.classifications(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search queries table (for analytics)
CREATE TABLE public.search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_resources_user_id ON public.resources(user_id);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_space_id ON public.resources(space_id);
CREATE INDEX idx_resources_classification_id ON public.resources(classification_id);
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX idx_resources_title_search ON public.resources USING GIN(to_tsvector('english', title));
CREATE INDEX idx_resources_content_search ON public.resources USING GIN(to_tsvector('english', content));
CREATE INDEX idx_spaces_user_id ON public.spaces(user_id);
CREATE INDEX idx_search_queries_user_id ON public.search_queries(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User profiles: users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Spaces: users can only see and manage their own spaces
CREATE POLICY "Users can view own spaces" ON public.spaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaces" ON public.spaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spaces" ON public.spaces
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spaces" ON public.spaces
  FOR DELETE USING (auth.uid() = user_id);

-- Resources: users can only see and manage their own resources
CREATE POLICY "Users can view own resources" ON public.resources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resources" ON public.resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources" ON public.resources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources" ON public.resources
  FOR DELETE USING (auth.uid() = user_id);

-- Search queries: users can only see their own search history
CREATE POLICY "Users can view own search queries" ON public.search_queries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search queries" ON public.search_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Classifications: public read access (everyone can see classifications)
CREATE POLICY "Anyone can view classifications" ON public.classifications
  FOR SELECT USING (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default classifications (Library of Congress inspired)
INSERT INTO public.classifications (name, code, description) VALUES
('Computer Science', 'QA76', 'Computing, algorithms, programming'),
('Education', 'L', 'Learning, teaching, educational systems'),
('Philosophy', 'B', 'Philosophy, psychology, logic'),
('Science', 'Q', 'Natural sciences, mathematics'),
('Technology', 'T', 'Engineering, technology, applied sciences'),
('Social Sciences', 'H', 'Sociology, economics, politics'),
('Arts', 'N', 'Fine arts, music, recreation'),
('Literature', 'P', 'Language, literature, linguistics'),
('History', 'D', 'History, geography, biography'),
('Medicine', 'R', 'Medicine, health sciences');

-- Function to search resources with full-text search
CREATE OR REPLACE FUNCTION public.search_resources(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  url TEXT,
  type resource_type,
  tags TEXT[],
  space_name TEXT,
  classification_name TEXT,
  rank REAL
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
    s.name as space_name,
    c.name as classification_name,
    ts_rank(
      to_tsvector('english', r.title || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.content, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM public.resources r
  LEFT JOIN public.spaces s ON r.space_id = s.id
  LEFT JOIN public.classifications c ON r.classification_id = c.id
  WHERE 
    (user_uuid IS NULL OR r.user_id = user_uuid)
    AND (
      to_tsvector('english', r.title || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.content, ''))
      @@ plainto_tsquery('english', search_query)
      OR r.tags && ARRAY[search_query]
    )
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

