import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router: ReturnType<typeof Router> = Router();
const prisma = new PrismaClient();

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

export default router;
