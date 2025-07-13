// File: types/env.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    DATABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Redis
    REDIS_URL: string;

    // AI & Vector DBs
    PINECONE_API_KEY: string;
    PINECONE_URL: string;
    GOOGLE_AI_API_KEY: string;
  }
}
