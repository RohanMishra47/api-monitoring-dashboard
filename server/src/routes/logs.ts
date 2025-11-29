import { PrismaPg } from "@prisma/adapter-pg";
import { Router } from "express";
import { Pool } from "pg";
import { PrismaClient } from "src/generated/client.js";

// Prisma 7 client setup with PostgreSQL adapter
const connectionString = process.env["DATABASE_URL"];
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const router: ReturnType<typeof Router> = Router();

router.get("/", async (req, res) => {
  const { endpointId } = req.query;

  if (!endpointId || typeof endpointId !== "string") {
    return res.status(400).json({ error: "Missing or invalid endpointId" });
  }

  try {
    const logs = await prisma.log.findMany({
      where: { endpointId },
      orderBy: { timestamp: "desc" },
      take: 100, //limit for performance
    });

    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
