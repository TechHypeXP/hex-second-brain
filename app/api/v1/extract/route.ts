// File: app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { systemConfig } from "@/config/system";
const { db: { prisma }, redis: { client: redis } } = systemConfig;

// Input validation schema
const ExtractRequestSchema = z.object({
  resourceId: z.string().uuid(),
  content: z.string(),
  type: z.enum(["video", "article", "pdf", "onenote"]),
  config: z.object({
    chunkSize: z.number().min(100).max(1000),
    embeddingModel: z.enum(["gemini-flash", "gemini-pro"]),
  }),
});

// Initialize services
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY as string);
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});
const index = pinecone.index("second-brain").namespace("extract");

export async function POST(request: NextRequest) {
  // Validate request body
  const body = await request.json();
  const parsedBody = ExtractRequestSchema.safeParse(body);
  
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request format", details: parsedBody.error },
      { status: 400 }
    );
  }

  const { resourceId, content, type, config } = parsedBody.data;

  // Get Gemini model based on config
  const model = genAI.getGenerativeModel({
    model: config.embeddingModel === "gemini-flash" ? "gemini-2.5-flash" : "gemini-2.5-pro",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
  });

  // Process content based on type
  let processedContent = content;
  if (type === "video") {
    // For videos, extract keyframes and transcribe audio
    // This would be implemented with a video processing library
    processedContent = "Video content processing not yet implemented";
  } else if (type === "pdf" || type === "onenote") {
    // For PDFs/OneNote, extract text and metadata
    processedContent = "PDF/OneNote content processing not yet implemented";
  }

  // Generate embeddings using Gemini
  const result = await model.generateContent(processedContent);
  const response = result.response;
  const text = response.text();

  // Store in Supabase and Pinecone
  // This would be implemented with Prisma and Pinecone clients
  const supabaseResult = "Supabase storage not yet implemented";
  const pineconeResult = "Pinecone storage not yet implemented";

  return NextResponse.json({
    resourceId,
    embeddings: text,
    supabase: supabaseResult,
    pinecone: pineconeResult,
    config,
  });
}
