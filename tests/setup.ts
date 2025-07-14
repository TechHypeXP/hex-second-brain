import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setup() {
  // Delete the user and profile if they exist to ensure a clean state
  try {
    await prisma.userProfile.delete({
      where: { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
    });
    await prisma.user.delete({
      where: { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
    });
  } catch (error) {
    // Ignore errors if the user or profile don't exist
  }

  await prisma.user.create({
    data: {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      email: 'testuser@example.com',
      user_profile: {
        create: {
          email: 'testuser@example.com',
          fullName: 'Test User',
        },
      },
    },
  });
}

export default setup;
