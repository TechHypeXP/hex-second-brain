import { Queue } from 'bullmq';

const queue = new Queue('jobQueue', { connection: { host: 'localhost', port: 6379 } });

async function testAgentChain() {
  try {
    await queue.add('ingestion', {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example YouTube URL
      type: 'youtube',
    });
    console.log('Ingestion job added to queue');
  } catch (e) {
    console.error('Error adding ingestion job:', e);
  }
}

testAgentChain();
