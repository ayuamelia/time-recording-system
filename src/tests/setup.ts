import prisma from '../config/database';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function cleanDb() {
  await prisma.timeRecord.deleteMany();
  await prisma.workCalendarOverride.deleteMany();
  await prisma.workConfig.deleteMany();
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});