import { authMiddleware } from "@/middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router: ReturnType<typeof Router> = Router();
const prisma = new PrismaClient();

// Create a new endpoint
router.post("/", authMiddleware, async (req, res) => {
  const { name, url, interval, thresholdMs } = req.body;
  const userId = req.user?.id; // Extract user ID from the request object

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. User ID not found." });
  }

  const ALLOWED_MINUTES = [5, 10, 15];

  if (!name || !url || interval === undefined || thresholdMs === undefined) {
    return res.status(400).json({
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
        userId, // Associate endpoint with the authenticated user
        lastCheckedAt: new Date(), // Initialize lastCheckedAt to current time
      },
    });

    return res.status(201).json(endpoint);
  } catch (err) {
    console.error("Endpoint creation failed:", err);
    return res
      .status(500)
      .json({ error: "Failed to create endpoint due to server error." });
  }
});

// Update endpoint check interval
router.patch("/:id/interval", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { intervalMinutes } = req.body;
  const userId = req.user?.id; // Extract user ID from the request object

  if (!id) {
    return res
      .status(400)
      .json({ error: "Endpoint ID is required in the URL parameters." });
  }

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. User ID not found." });
  }

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
    // Check if the endpoint exists and belongs to the user
    const endpoint = await prisma.endpoint.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!endpoint) {
      return res
        .status(404)
        .json({ error: `Endpoint with ID ${id} not found.` });
    }

    if (endpoint.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden. You do not own this endpoint." });
    }

    // Update the endpoint's interval if all checks pass
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

// Get all endpoints for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user?.id; // Extract user ID from the request object

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. User ID not found." });
  }

  try {
    const endpoints = await prisma.endpoint.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        interval: true,
        thresholdMs: true,
        createdAt: true,
        lastCheckedAt: true,
      },
    });
    return res.status(200).json({ endpoints });
  } catch (err) {
    console.error("Failed to fetch endpoints:", err);
    return res.status(500).json({ error: "Failed to fetch endpoints." });
  }
});

export default router;
