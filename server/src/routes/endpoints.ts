import prisma from "@/config/prisma_client.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { Router } from "express";

const router: ReturnType<typeof Router> = Router();

// Helper function
function isValidUrl(string: string | URL) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Define the type for allowed updates
type EndpointUpdates = {
  name?: string;
  url?: string;
  interval?: number;
  threshold?: number;
};

// Create a new endpoint
router.post("/", authMiddleware, async (req, res) => {
  const { name, url, interval, thresholdMs } = req.body;
  const userId = req.user?.id; // Extract user ID from the request object

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. User ID not found." });
  }

  const ALLOWED_MINUTES = [1, 5, 10, 15];

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

// Update endpoint properties
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // Extract user ID from the request object

  try {
    if (!id) {
      return res
        .status(400)
        .json({ error: "Endpoint ID is required in the URL parameters." });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized. User ID not found." });
    }
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

    // Define what fields can be updated
    const allowedFields: (keyof EndpointUpdates)[] = [
      "name",
      "url",
      "interval",
      "threshold",
    ];

    const allowedIntervals = [5, 10, 15];

    // extract only allowed field from request body
    const updates: EndpointUpdates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Using a type assertion to avoid TS error when assigning dynamic keys
        (updates as any)[field] = req.body[field];
      }
    });

    // Validate atleast one field is being updated
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Field-specific validations
    if (updates.url && !isValidUrl(updates.url)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    if (updates.interval && !allowedIntervals.includes(updates.interval)) {
      return res
        .status(400)
        .json({ error: "Interval must be 5, 10, or 15 minutes" });
    }

    // Convert minutes → seconds
    if (updates.interval) {
      updates.interval = updates.interval * 60;
    }

    // Update the endpoint if all checks pass
    const updatedEndpoint = await prisma.endpoint.update({
      where: { id },
      data: updates,
    });

    return res.status(200).json({
      message: "Endpoint updated successfully",
      endpoint: updatedEndpoint,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: `Endpoint with ID ${id} not found.` });
    }
    console.error("Database update failed:", error);
    return res.status(500).json({ error: "Failed to update endpoint." });
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

// Logs for a specific endpoint
router.get("/:id/logs", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // From my auth middleware
  const limit = parseInt(req.query["limit"] as string) || 10;
  const hours = parseInt(req.query["hours"] as string) || 24;

  if (!id) {
    return res
      .status(400)
      .json({ error: "Endpoint ID is required in the URL parameters." });
  }

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. User ID not found." });
  }

  try {
    const endpoint = await prisma.endpoint.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!endpoint) {
      return res
        .status(404)
        .json({ error: `Endpoint with ID ${id} not found.` });
    }

    if (endpoint.userId !== userId) {
      return res
        .status(403)
        .json({ error: "you don't permission to view this endpoint logs." });
    }

    // Get logs from last X hours
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const logs = await prisma.log.findMany({
      where: {
        endpointId: id,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: "asc" }, // Ascending for charts
      take: limit,
      select: {
        id: true,
        statusCode: true,
        latencyMs: true,
        timestamp: true,
        error: true,
      },
    });

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return res.status(500).json({ error: "Failed to fetch logs." });
  }
});

// Delete an endpoint
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // From my auth middleware

  if (!id) {
    return res
      .status(400)
      .json({ error: "Endpoint ID is required in the URL parameters." });
  }

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. User ID not found." });
  }

  try {
    const endpoint = await prisma.endpoint.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!endpoint) {
      return res
        .status(404)
        .json({ error: `Endpoint with ID ${id} not found.` });
    }

    if (endpoint.userId !== userId) {
      return res
        .status(403)
        .json({ error: "you don't permission to delete this endpoint." });
    }

    await prisma.endpoint.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Endpoint deleted successfully.",
      id,
    });
  } catch (error) {
    console.error("Failed to delete endpoint:", error);
    return res.status(500).json({ error: "Failed to delete endpoint." });
  }
});

export default router;
