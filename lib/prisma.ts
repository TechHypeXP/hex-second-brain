import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Define a function to initialize the Prisma client
const initializePrisma = () => {
  console.log('Initializing new Prisma Client...');
  return new PrismaClient({
    log: [
      { emit: 'stdout', level: 'query' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
    ],
  });
};

// Check if the Prisma client is already initialized
if (process.env.NODE_ENV === 'production') {
  // In production, create a single instance
  prisma = initializePrisma();
} else {
  // In development, reuse the existing instance or create a new one
  if (!global.prisma) {
    global.prisma = initializePrisma();
  }
  prisma = global.prisma;
}

// Define a function to test the database connection
export const testPrismaConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Database connection successful.');
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

export default prisma;
