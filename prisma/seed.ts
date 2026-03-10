import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database…");

  // Default work config
  const existing = await prisma.workConfig.findFirst();
  if (!existing) {
    await prisma.workConfig.create({
      data: {
        normalHoursPerDay: 8,
        workingDaysOfWeek: JSON.stringify([1, 2, 3, 4, 5]), // Mon–Fri
        effectiveFrom: new Date(),
      },
    });
    console.log("  ✔ Created default WorkConfig (8 h/day, Mon–Fri)");
  }

  // Sample users
  const passwordHash = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Smith",
      email: "alice@example.com",
      passwordHash,
      role: "employee",
    },
  });
  const bob = await prisma.user.upsert({
  where: { email: 'bob@example.com' },
  update: {},
  create: {
    name: 'Bob Jones',
    email: 'bob@example.com',
    passwordHash,
    role: 'admin',
  },
});
  console.log(
    `  ✔ Users: ${alice.name} (${alice.id}), ${bob.name} (${bob.id})`,
  );

  // Sample completed time records for Alice
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const clockIn = new Date(today);
  clockIn.setHours(9, 0, 0, 0);
  const clockOut = new Date(today);
  clockOut.setHours(18, 30, 0, 0); // 9.5 h → 1.5 h overtime

  await prisma.timeRecord.create({
    data: {
      userId: alice.id,
      clockIn,
      clockOut,
      date: today,
      workedMinutes: 570, // 9h 30m
      overtimeMinutes: 90, // 1h 30m
    },
  });
  console.log("  ✔ Sample time record created for Alice");

  console.log("🎉  Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
