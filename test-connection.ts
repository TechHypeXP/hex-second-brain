require('dotenv').config();
const { testPrismaConnection } = require('./lib/prisma');

testPrismaConnection();
