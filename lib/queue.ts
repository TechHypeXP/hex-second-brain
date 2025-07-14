import { Queue } from 'bullmq';
import { redis } from './redis';

export const jobQueue = new Queue('jobQueue', { connection: redis });
