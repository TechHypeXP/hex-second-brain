-- This is the complete and corrected migration script.
-- It defines all custom types before creating and altering tables.

-- Part 1: Define All Custom ENUM Types

CREATE TYPE "public"."ContentDomain" AS ENUM ('business', 'technology');
CREATE TYPE "public"."ResourceType" AS ENUM ('video', 'article', 'pdf', 'onenote');
CREATE TYPE "public"."ComplexityLevel" AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE "public"."ActionDensity" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "public"."ChunkType" AS ENUM ('text', 'image', 'audio', 'video');
CREATE TYPE "public"."PracticalApplicability" AS ENUM ('immediate', 'short_term', 'long_term');
CREATE TYPE "public"."RelationshipType" AS ENUM ('RELATED', 'SEQUEL', 'PREQUEL', 'SUPPORTS', 'CONTRADICTS');
CREATE TYPE "public"."ImplementationStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
CREATE TYPE "public"."BatchJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE "public"."PromptLogTier" AS ENUM ('extract', 'validate', 'rag');


-- Part 2: Create New Tables

CREATE TABLE "public"."batch_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "status" "public"."BatchJobStatus" NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total_items" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "batch_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."prompt_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "query_text" TEXT NOT NULL,
    "tier" "public"."PromptLogTier" NOT NULL,
    "response" JSONB,
    "error" TEXT,
    "latency_ms" INTEGER,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "prompt_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."change_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "change_type" TEXT NOT NULL,
    "change_details" JSONB NOT NULL DEFAULT '{}',
    "user_id" UUID,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "change_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."resource_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "version_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "resource_id" UUID NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "resource_versions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "resource_versions_resource_id_version_number_key" UNIQUE ("resource_id", "version_number")
);


-- Part 3: Add Foreign Key Constraints to New Tables

ALTER TABLE "public"."batch_jobs" ADD CONSTRAINT "batch_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."prompt_logs" ADD CONSTRAINT "prompt_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."change_log" ADD CONSTRAINT "change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."resource_versions" ADD CONSTRAINT "resource_versions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."resource_versions" ADD CONSTRAINT "resource_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Part 4: Update Existing Tables with Soft-Delete Columns and Indexes

ALTER TABLE "public"."user_profiles" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_user_profiles_deleted_at" ON "public"."user_profiles"("deleted_at");

ALTER TABLE "public"."spaces" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_spaces_deleted_at" ON "public"."spaces"("deleted_at");

ALTER TABLE "public"."resources" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_resources_deleted_at" ON "public"."resources"("deleted_at");

ALTER TABLE "public"."classifications" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_classifications_deleted_at" ON "public"."classifications"("deleted_at");

ALTER TABLE "public"."content_summaries" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_content_summaries_deleted_at" ON "public"."content_summaries"("deleted_at");

ALTER TABLE "public"."vector_chunks" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_vector_chunks_deleted_at" ON "public"."vector_chunks"("deleted_at");

ALTER TABLE "public"."content_relationships" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_content_relationships_deleted_at" ON "public"."content_relationships"("deleted_at");

ALTER TABLE "public"."knowledge_nodes" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_knowledge_nodes_deleted_at" ON "public"."knowledge_nodes"("deleted_at");

ALTER TABLE "public"."knowledge_edges" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
CREATE INDEX "idx_knowledge_edges_deleted_at" ON "public"."knowledge_edges"("deleted_at");