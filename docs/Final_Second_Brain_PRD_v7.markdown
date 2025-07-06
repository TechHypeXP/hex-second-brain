# Final Second Brain Product Requirements Document (PRD) v7

## 1. Overview
The Second Brain is a personal knowledge management system for 2,500–3,200 resources (1,000 videos, 1,000 articles, 300 PDFs, 200 OneNote pages), scaling to 1,000–10,000 SaaS users. The MVP uses Next.js with Vite, shadcn/ui, Prisma, Zod, and Capacitor, deployed on Vercel’s free tier, with a tri-database architecture (Supabase, Pinecone, local PostgreSQL/`pgvector`) and Gemini models.

### 1.1 Objectives
- **MVP Goal**: Validate product-market fit in 1–5 days for 5–10 alpha users and 20–30 beta users, costing $0/month.
- **SaaS Potential**: Scale to 1,000–10,000 users with 1,000 resources each.
- **Key Features**:
  - Session-agnostic batch processing with BullMQ.
  - Versioning for resources.
  - Two-tier RAG chat (Prompt #1: Extraction, Prompt #2: Validation/Analysis) with JSON output in the application layer.
  - Simplified classification system (akin to Library of Congress) and tagging.
  - Edgy landing page with fluid animations (xAI/reactbits.dev-inspired).
  - Comprehensive configuration management via UI and files.

### 1.2 Scope
- **In Scope**: Batch processing, versioning, two-tier RAG chat, classification system, tagging, Pinecone for MVP, local PostgreSQL/`pgvector` for testing, shadcn/ui, mobile support, configurable settings, Prisma, Zod.
- **Out of Scope (MVP)**: Full LoC classification, browser extension, knowledge graph visualization, dedicated API gateway.

## 2. Requirements

### 2.1 Functional Requirements
- **FR1: Batch Processing**:
  - Upload 100–1,000 resources with session-agnostic processing using BullMQ (Upstash Redis) and Supabase real-time subscriptions.
  - UI shows progress (e.g., “Processing 50/100 videos”).
- **FR2: Versioning**:
  - Track changes in `resource_versions` table via Prisma.
  - View/restore versions via dashboard.
- **FR3: RAG Chat**:
  - Prompt #1 (Gemini 2.5 Flash/Lite): Extract summaries, samples, metrics, categories, and tags (Markdown); store in Supabase.
  - Prompt #2 (Gemini 2.5 Pro): Validate summaries, generate foresight if PASS (Markdown); store in Supabase.
  - JSON output generated in API layer with 97.5% confidence target.
- **FR4: Classification and Tagging**:
  - Simplified hierarchical classification (e.g., "Technology > AI") via `categories` table.
  - User-defined and auto-suggested tags via `tags TEXT[]` and Prompt #1.
  - Assign categories/tags via `/app/dashboard` or `/app/settings`.
- **FR5: Landing Page**:
  - Next.js with shadcn/ui, Framer Motion, cursor-aware cloud background, purple-blue gradients.
- **FR6: Settings**:
  - Configure embedding model, chunk size, database, validation weights via UI (`/app/settings`) and `/config/system.ts`. Log changes in `change_log`.
  - Re-embed resources with cost alert (e.g., “~$0 for Gemini”).
- **FR7: Data Validation**:
  - Use Zod for input/output validation in API routes.

### 2.2 Non-Functional Requirements
- **NFR1: Performance**: Batch process 100 resources in <5 minutes; search latency <1 second.
- **NFR2: Scalability**: Handle 3,200 resources (16,000 vectors) in Pinecone for MVP; 7 million vectors in `pgvector` for SaaS.
- **NFR3: Cost**: $0/month (Vercel free, Supabase free, Pinecone free, Google AI Studio free, Upstash free).
- **NFR4: Usability**: Accessible, mobile-friendly UI with fluid animations.

### 2.3 User Stories
- **US1**: As a user, I want to upload a 100-video playlist, close my browser, and see progress later.
- **US2**: As a user, I want to ask, “What are YouTube best practices?” and get JSON answers with citations.
- **US3**: As a user, I want to revert resource versions.
- **US4**: As a user, I want a visually engaging landing page.
- **US5**: As a user, I want to configure system settings and track changes.
- **US6**: As a user, I want to assign categories (e.g., "Technology > AI") and tags to resources.

## 3. System Design
- **Frontend**: Next.js (App Router, `.tsx`) with Vite, shadcn/ui, Framer Motion, Tailwind CSS, Capacitor for mobile.
- **Backend**: Supabase (auth, metadata, categories), Pinecone (MVP vectors), local PostgreSQL/`pgvector` (SaaS prep), Prisma (ORM), Zod (validation), BullMQ (task queuing with Upstash).
- **APIs**: Google AI Studio for Gemini embeddings and two-tier RAG chat.

### 3.1 Database Schema
```sql
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  type VARCHAR(50) CHECK (type IN ('video', 'article', 'pdf', 'onenote')),
  tags TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.resource_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.batch_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.prompt_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query_text TEXT NOT NULL,
  tier VARCHAR(50) CHECK (tier IN ('extract', 'validate', 'rag')),
  response JSONB,
  error TEXT,
  latency_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.change_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  change_type VARCHAR(50) NOT NULL,
  change_details JSONB NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 API Routes
- Reused from previous response (`/app/api/extract`, `/app/api/validate`, `/app/api/rag-query`, `/app/api/re-embed`) with category support in `/app/api/extract`.

## 4. Implementation Plan
- **Day 1**: Set up Next.js with Vite, shadcn/ui, Framer Motion, Prisma, Zod, and Capacitor. Implement landing page.
- **Day 2**: Update existing Supabase schema (add `categories`, `category_id`). Set up Pinecone index and Upstash. Implement batch processing with BullMQ and `/app/api/extract`.
- **Day 3**: Implement `/app/api/validate`, `/app/api/rag-query`, and category/tagging UI in `/app/dashboard`.
- **Day 4**: Implement `/app/settings` for configuration and Capacitor for mobile. Test re-embedding.
- **Day 5**: Test with 100-video playlist, deploy to Vercel, run alpha test (5–10 users).

## 5. Cost Estimate
- **Vercel**: Free (hobby tier).
- **Supabase**: Free (500MB database).
- **Pinecone**: Free (100,000 vectors).
- **Google AI Studio**: Free (Gemini Flash/Lite, Pro).
- **Upstash**: Free (10,000 commands/day).
- **Total**: $0/month.

## 6. Success Metrics
- **Alpha**: 90% upload success, <1-second search latency, session-agnostic progress, configurable settings, category/tagging support.
- **Beta**: 80% retention, 97.5% RAG confidence score.