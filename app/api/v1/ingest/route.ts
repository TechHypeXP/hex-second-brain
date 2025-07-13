import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';

const jobQueue = new Queue('jobQueue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const fileBuffer = await file.arrayBuffer();
      const fileContent = Buffer.from(fileBuffer).toString('utf-8'); // Assuming text file

      await jobQueue.add('ingestFile', {
        fileName: file.name,
        fileContent: fileContent,
        type: 'file',
      });

      return NextResponse.json({ message: 'File ingestion job added', fileName: file.name });

    } else if (contentType && contentType.includes('application/json')) {
      // Handle URL submission
      const { url, type } = await request.json();

      if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
      }

      await jobQueue.add('ingestUrl', { url, type });

      return NextResponse.json({ message: 'URL ingestion job added', url });

    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
    }
  } catch (error) {
    console.error('Ingestion API error:', error);
    return NextResponse.json({ error: 'Failed to process ingestion request' }, { status: 500 });
  }
}
