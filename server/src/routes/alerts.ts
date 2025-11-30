import { Router } from "express";
import prisma from "prisma/prisma_client.js";

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
