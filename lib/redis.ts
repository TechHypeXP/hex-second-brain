 import Redis from 'ioredis';
import { env } from 'process';

const redis = new Redis(env.REDIS_URL!);

export { redis };
