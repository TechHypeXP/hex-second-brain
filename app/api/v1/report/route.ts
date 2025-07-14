import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt to fetch the most recent ContentSummary record
    const latestSummary: any[] = await prisma.$queryRaw`
      SELECT 
        cs.id, 
        cs."executiveSummary", 
        cs."keyInsights", 
        cs."criticalWarnings", 
        cs."immediateActions", 
        cs.created_at,
        r.title,
        r.type as "resourceType"
      FROM 
        public."content_summaries" cs
      LEFT JOIN 
        public.resources r ON cs."resourceId" = r.id
      ORDER BY 
        cs.created_at DESC
      LIMIT 1
    `;

    // If no summary found, return a default report
    if (!latestSummary || latestSummary.length === 0) {
      return NextResponse.json({ 
        title: 'No Recent Analysis',
        summary: 'No analysis reports have been generated yet. Please process a document first.',
        keyFindings: [],
        recommendations: [],
        metadata: {
          resourceType: 'N/A',
          processingDate: new Date().toISOString(),
          embeddingModel: 'N/A',
          totalChunks: 0,
          keywords: [],
          semanticTags: []
        },
        generatedAt: new Date().toISOString(),
        disclaimer: 'No analysis available. Please upload and process a document to generate a report.'
      }, { status: 404 });
    }

    // Transform the raw query result
    const summary = latestSummary[0];
    const report = {
      title: `Analysis Report for ${summary.title || 'Unnamed Resource'}`,
      summary: summary.executiveSummary || 'No summary available',
      keyFindings: [
        ...(summary.keyInsights ? [summary.keyInsights] : []),
        ...(summary.criticalWarnings ? [summary.criticalWarnings] : [])
      ],
      recommendations: [
        ...(summary.immediateActions ? [summary.immediateActions] : [])
      ],
      metadata: {
        resourceType: summary.resourceType || 'Unknown',
        processingDate: summary.created_at?.toISOString() || new Date().toISOString(),
        embeddingModel: 'gemini', // Default fallback
        totalChunks: 0, // Placeholder
        keywords: [], // Placeholder
        semanticTags: [] // Placeholder
      },
      generatedAt: new Date().toISOString(),
      disclaimer: 'This report was generated with limited data. More comprehensive analysis requires processing additional documents.'
    };

    return NextResponse.json(report);
  } catch (error) {
    // Comprehensive error handling
    console.error('Report Generation Error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma connection errors
      return NextResponse.json({ 
        error: 'Database Connection Error',
        details: 'Unable to connect to the database. Please check your connection settings.',
        code: error.code
      }, { status: 500 });
    } else if (error instanceof Error) {
      // Generic error handling
      return NextResponse.json({ 
        error: 'Report Generation Failed',
        details: error.message
      }, { status: 500 });
    } else {
      // Unexpected error type
      return NextResponse.json({ 
        error: 'Unexpected Error',
        details: 'An unknown error occurred while generating the report.'
      }, { status: 500 });
    }
  } finally {
    // Ensure database connection is closed
    await prisma.$disconnect();
  }
}
