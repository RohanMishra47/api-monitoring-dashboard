import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "src/generated/client.js";

// Prisma 7 client setup with PostgreSQL adapter
const connectionString = process.env["DATABASE_URL"];
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedEndpoints() {
  const endpoints = [
    {
      name: "Google API",
      url: "https://www.google.com",
      interval: 120,
      thresholdMs: 500,
    },
  ];

  for (const ep of endpoints) {
    await prisma.endpoint.create({ data: ep });
  }

  console.log("Seeded mock endpoints.");
}

seedEndpoints()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
