-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ContentDomain" AS ENUM ('business', 'technology');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('video', 'article', 'pdf', 'onenote');

-- CreateEnum
CREATE TYPE "public"."ComplexityLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "public"."ActionDensity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "public"."ChunkType" AS ENUM ('text', 'image', 'audio', 'video');

-- CreateEnum
CREATE TYPE "public"."PracticalApplicability" AS ENUM ('immediate', 'short-term', 'long-term');

-- CreateEnum
CREATE TYPE "public"."RelationshipType" AS ENUM ('RELATED', 'SEQUEL', 'PREQUEL', 'SUPPORTS', 'CONTRADICTS');

-- CreateEnum
CREATE TYPE "public"."ImplementationStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "public"."BatchJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "public"."PromptLogTier" AS ENUM ('extract', 'validate', 'rag');

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{"auto_process": true, "default_domain": "business", "embedding_model": "gemini", "preferred_chunk_size": 1000, "notification_settings": {"weekly_digest": true, "processing_complete": true}}',
    "total_processed_content" INTEGER NOT NULL DEFAULT 0,
    "total_embeddings" INTEGER NOT NULL DEFAULT 0,
    "monthly_quota_used" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "domain" "public"."ContentDomain" NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "content_count" INTEGER NOT NULL DEFAULT 0,
    "last_accessed" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinecone_namespace" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "type" "public"."ResourceType" NOT NULL,
    "content" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domain" "public"."ContentDomain" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "complexityLevel" "public"."ComplexityLevel" NOT NULL,
    "estimated_read_time_minutes" INTEGER,
    "word_count" INTEGER,
    "processingStatus" "public"."ProcessingStatus" NOT NULL,
    "processed_at" TIMESTAMPTZ(6),
    "actionDensity" "public"."ActionDensity" NOT NULL,
    "novelty_score" INTEGER DEFAULT 1,
    "practicalApplicability" "public"."PracticalApplicability",
    "userId" UUID NOT NULL,
    "spaceId" UUID,
    "classificationId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "version_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "resource_id" UUID NOT NULL,
    "created_by" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "domain" "public"."ContentDomain" NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isSystemDefault" BOOLEAN NOT NULL DEFAULT false,
    "parentId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_summaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executive_summary" TEXT NOT NULL,
    "key_insights" TEXT,
    "immediate_actions" TEXT,
    "critical_warnings" TEXT,
    "key_metrics" JSONB NOT NULL DEFAULT '{}',
    "tools_resources" JSONB NOT NULL DEFAULT '{}',
    "people_companies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primary_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "semantic_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "question_based_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "total_chunks" INTEGER NOT NULL DEFAULT 0,
    "embedding_model" TEXT NOT NULL DEFAULT 'gemini',
    "avg_chunk_tokens" INTEGER,
    "resource_id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "content_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vector_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chunk_index" INTEGER NOT NULL,
    "chunkType" "public"."ChunkType" NOT NULL,
    "content" TEXT NOT NULL,
    "token_count" INTEGER NOT NULL,
    "pinecone_id" TEXT,
    "pinecone_namespace" TEXT,
    "embedding_model" TEXT NOT NULL DEFAULT 'gemini',
    "vector_dimension" INTEGER NOT NULL DEFAULT 768,
    "overlapping_chunks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "semantic_density" DECIMAL(65,30),
    "retrieval_frequency" INTEGER NOT NULL DEFAULT 0,
    "last_retrieved" TIMESTAMPTZ(6),
    "resource_id" UUID NOT NULL,
    "summary_id" UUID NOT NULL,
    "parent_chunk_id" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "vector_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_relationships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "relationshipType" "public"."RelationshipType" NOT NULL,
    "confidence_score" DECIMAL(65,30) NOT NULL DEFAULT 0.5,
    "relationship_reason" TEXT,
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT true,
    "source_resource_id" UUID NOT NULL,
    "target_resource_id" UUID NOT NULL,
    "created_by" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "content_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."knowledge_nodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "domain" "public"."ContentDomain",
    "importance_score" INTEGER NOT NULL DEFAULT 1,
    "mention_frequency" INTEGER NOT NULL DEFAULT 1,
    "mentioned_in_resources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "first_mentioned_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_mentioned_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "knowledge_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."knowledge_edges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "relationshipType" "public"."RelationshipType" NOT NULL,
    "strength" DECIMAL(65,30) NOT NULL DEFAULT 0.5,
    "evidence_resources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT true,
    "source_node_id" UUID NOT NULL,
    "target_node_id" UUID NOT NULL,
    "created_by" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "knowledge_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_queries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "query" TEXT NOT NULL,
    "query_type" TEXT NOT NULL DEFAULT 'semantic',
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "avg_relevance_score" DECIMAL(65,30),
    "clicked_results" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extracted_intent" TEXT,
    "domainClassification" "public"."ContentDomain",
    "complexityDetected" "public"."ComplexityLevel",
    "response_time_ms" INTEGER,
    "user_satisfaction" INTEGER,
    "user_id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" TEXT NOT NULL,
    "event_details" JSONB NOT NULL DEFAULT '{}',
    "session_id" TEXT,
    "comprehension_level" INTEGER,
    "implementationStatus" "public"."ImplementationStatus",
    "device_type" TEXT,
    "time_spent_seconds" INTEGER,
    "referral_source" TEXT,
    "user_id" UUID NOT NULL,
    "resource_id" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batch_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "public"."BatchJobStatus" NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total_items" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prompt_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "query_text" TEXT NOT NULL,
    "tier" "public"."PromptLogTier" NOT NULL,
    "response" JSONB,
    "error" TEXT,
    "latency_ms" INTEGER,
    "user_id" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."change_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "change_type" TEXT NOT NULL,
    "change_details" JSONB NOT NULL DEFAULT '{}',
    "user_id" UUID,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."execution_log" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "logOutput" TEXT,
    "errorMessage" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "execution_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "public"."user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_pinecone_namespace_key" ON "public"."spaces"("pinecone_namespace");

-- CreateIndex
CREATE UNIQUE INDEX "resource_versions_resource_id_version_number_key" ON "public"."resource_versions"("resource_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "classifications_code_key" ON "public"."classifications"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vector_chunks_pinecone_id_key" ON "public"."vector_chunks"("pinecone_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_nodes_name_key" ON "public"."knowledge_nodes"("name");

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spaces" ADD CONSTRAINT "spaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "public"."classifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_versions" ADD CONSTRAINT "resource_versions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_versions" ADD CONSTRAINT "resource_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classifications" ADD CONSTRAINT "classifications_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."classifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_summaries" ADD CONSTRAINT "content_summaries_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vector_chunks" ADD CONSTRAINT "vector_chunks_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vector_chunks" ADD CONSTRAINT "vector_chunks_summary_id_fkey" FOREIGN KEY ("summary_id") REFERENCES "public"."content_summaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vector_chunks" ADD CONSTRAINT "vector_chunks_parent_chunk_id_fkey" FOREIGN KEY ("parent_chunk_id") REFERENCES "public"."vector_chunks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_relationships" ADD CONSTRAINT "content_relationships_source_resource_id_fkey" FOREIGN KEY ("source_resource_id") REFERENCES "public"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_relationships" ADD CONSTRAINT "content_relationships_target_resource_id_fkey" FOREIGN KEY ("target_resource_id") REFERENCES "public"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_relationships" ADD CONSTRAINT "content_relationships_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."knowledge_edges" ADD CONSTRAINT "knowledge_edges_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "public"."knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."knowledge_edges" ADD CONSTRAINT "knowledge_edges_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "public"."knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."knowledge_edges" ADD CONSTRAINT "knowledge_edges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_queries" ADD CONSTRAINT "search_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_analytics" ADD CONSTRAINT "learning_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_analytics" ADD CONSTRAINT "learning_analytics_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_jobs" ADD CONSTRAINT "batch_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prompt_logs" ADD CONSTRAINT "prompt_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_log" ADD CONSTRAINT "change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

