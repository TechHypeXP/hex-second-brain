# Living Implementation Blueprint for Second Brain Alpha (PRD v8)

## Part 1: Revision and Architecture

### 1.1 System Architecture
- **Frontend**: Next.js 14 (App Router) with Vite, shadcn/ui, Tailwind CSS, Framer Motion
- **Backend**: Supabase (auth/metadata), Pinecone (vector DB), local PostgreSQL/`pgvector` (SaaS prep), Prisma ORM, BullMQ (task queue), Zod (validation)
- **AI Services**: Google AI Studio (Gemini 2.5 Flash/Lite for extraction, Gemini 2.5 Pro for validation/analysis)
- **Mobile**: Capacitor for cross-platform support (iOS/Android)

### 1.2 Technical Requirements
- **Batch Processing**: Session-agnostic via BullMQ (Upstash Redis), with Supabase real-time updates
- **Versioning**: Track `resource_versions` via Prisma, enable restore via dashboard
- **RAG Chat**: Two-tier system with JSON output in API layer, 97.5% confidence target
- **Classification**: Hierarchical system (e.g., "Technology > AI") via `categories` table
- **Cost**: $0/month (Vercel free tier, Supabase free, Pinecone free, Google AI Studio free, Upstash free)

## Part 2: Product and Feature Requirements for Alpha

### 2.1 Core Features
- **Resource Upload**: Support 100–1,000 resources (videos, articles, PDFs, OneNote)
- **Progress Tracking**: UI shows "Processing X/Y resources" with session persistence
- **Configurable Settings**: Embedding model, chunk size, validation weights via `/app/settings` and `/config/system.ts`
- **Dark Mode**: Tailwind CSS theme with `@layer` and `@custom-variant` support
- **Landing Page**: Fluid animations (cursor-aware cloud background, purple-blue gradients)

### 2.2 Non-Functional Requirements
- **Performance**: Batch process 100 resources in <5 minutes, search latency <1s
- **Scalability**: 7 million vectors in `pgvector` for SaaS phase
- **Usability**: Mobile-friendly UI with Framer Motion transitions

## Part 3: Actionable Implementation Plan

### 3.1 Development Sequence
1. **Day 1**: 
   - Set up Next.js with Vite, shadcn/ui, and Tailwind CSS
   - Implement landing page with Framer Motion and cursor-aware cloud background
   - Configure dark mode using `globals.css` and Tailwind themes

2. **Day 2**: 
   - Update Supabase schema: add `categories`, `resource_versions`, and `change_log` tables
   - Initialize Pinecone index and integrate Upstash Redis for BullMQ
   - Implement `/app/api/extract` with Gemini Flash for resource processing

3. **Day 3**: 
   - Develop `/app/api/validate` and `/app/api/rag-query` using Gemini Pro
   - Add category/tagging UI in `/app/dashboard`
   - Implement Supabase real-time updates for batch job progress

4. **Day 4**: 
   - Create `/app/settings` for system configuration
   - Add Capacitor for mobile support (iOS/Android)
   - Test re-embedding with cost alerts

5. **Day 5**: 
   - Validate session-agnostic batch processing with 100-video playlist
   - Deploy to Vercel using Dockerized build
   - Run alpha test with 5–10 users

### 3.2 Validation Criteria
- **Alpha Success**: 
  - 90% upload success rate
  - <1s search latency
  - Session persistence in batch jobs
  - Configurable settings UI
  - Category/tagging functionality
