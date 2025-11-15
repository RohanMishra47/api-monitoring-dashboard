import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router: ReturnType<typeof Router> = Router();
const prisma = new PrismaClient();

// Create a new endpoint
router.post("/", async (req, res) => {
  const { name, url, interval, thresholdMs } = req.body;

  const ALLOWED_MINUTES = [5, 10, 15];

  if (!name || !url || interval === undefined || thresholdMs === undefined) {
    return res
      .status(400)
      .json({
        error: "Missing required fields (name, url, interval, thresholdMs)",
      });
  }

  const parsedIntervalMinutes = Number(interval);
  const parsedThresholdMs = Number(thresholdMs);

  if (
    !ALLOWED_MINUTES.includes(parsedIntervalMinutes) ||
    isNaN(parsedIntervalMinutes)
  ) {
    return res.status(400).json({
      error: `Invalid interval. Must be a number and one of: ${ALLOWED_MINUTES.join(
        ", "
      )} minutes.`,
    });
  }

  if (isNaN(parsedThresholdMs) || parsedThresholdMs <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid thresholdMs. Must be a positive number." });
  }

  //Unit Conversion for Database
  const intervalSeconds = parsedIntervalMinutes * 60; // Convert minutes to seconds

  try {
    const endpoint = await prisma.endpoint.create({
      data: {
        name,
        url,
        interval: intervalSeconds,
        thresholdMs: parsedThresholdMs,
      },
    });

    return res.status(201).json(endpoint);
  } catch (err) {
    console.error("Endpoint creation failed:", err);
    // You might add checks for unique URL constraints here (P2002 error code)
    return res
      .status(500)
      .json({ error: "Failed to create endpoint due to server error." });
  }
});

// Update endpoint check interval
router.patch("/api/endpoints/:id/interval", async (req, res) => {
  const { id } = req.params;
  const { intervalMinutes } = req.body;

  const allowedIntervals = [5, 10, 15];
  // Ensure intervalMinutes is treated as a number.
  const interval = Number(intervalMinutes ?? 5);

  if (!allowedIntervals.includes(interval)) {
    return res.status(400).json({
      error: `Invalid interval. Allowed values are ${allowedIntervals.join(
        ", "
      )} minutes.`,
    });
  }

  //Conversion to Seconds (Database Requirement)
  const intervalSeconds = interval * 60; // e.g., 5 * 60 = 300

  try {
    const updated = await prisma.endpoint.update({
      where: { id },
      data: { interval: intervalSeconds },
    });

    return res.status(200).json({ endpoint: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: `Endpoint with ID ${id} not found.` });
    }
    console.error("Database update failed:", error);
    return res
      .status(500)
      .json({ error: "Failed to update endpoint interval." });
  }
});
export default router;
