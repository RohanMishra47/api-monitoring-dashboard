import prisma from "@/config/prisma_client.js";
import { Router } from "express";

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
