import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router: ReturnType<typeof Router> = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { name, url, interval, thresholdMs } = req.body;

  if (!name || !url || !interval || !thresholdMs) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const endpoint = await prisma.endpoint.create({
      data: { name, url, interval, thresholdMs },
    });

    return res.status(201).json(endpoint);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create endpoint" });
  }
});

export default router;
