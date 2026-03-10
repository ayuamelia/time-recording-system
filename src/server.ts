import 'dotenv/config';
import app from './app';
import prisma from './config/database';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function main() {
  // Verify DB connection on startup
  await prisma.$connect();
  console.log('✅  Database connected');

  app.listen(PORT, () => {
    console.log(`🚀  Time Recording API running on http://localhost:${PORT}/api/v1`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
