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
  const activeOnly = req.query["activeOnly"] === "true";
  try {
    const alerts = await prisma.alert.findMany({
      where: activeOnly ? { resolvedAt: null } : {},
      include: { endpoint: true },
      orderBy: { triggeredAt: "desc" },
      take: 50,
    });

    return res.json(alerts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.patch("/:id/resolve", async (req, res) => {
  const { id } = req.params;

  try {
    const updated = prisma.alert.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });

    return res.json({ updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to resolve error" });
  }
});

export default router;
