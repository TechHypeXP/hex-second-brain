import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from 'process';

if (!env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set');
}

export const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
