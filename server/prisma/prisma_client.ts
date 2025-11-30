import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "src/generated/client.js";

// Prisma 7 client setup with PostgreSQL adapter
const pool = new pg.Pool({
  connectionString: process.env["DATABASE_URL"],
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
