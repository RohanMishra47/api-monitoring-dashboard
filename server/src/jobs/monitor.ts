import { PrismaClient } from "@prisma/client";
import axios from "axios";
import cron from "node-cron";

const prisma = new PrismaClient();

// Function to check/monitor an API endpoint
export function startMonitoring() {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    const endpoints = await prisma.endpoint.findMany();

    for (const endpoint of endpoints) {
      const start = Date.now();
      let statusCode = 0;
      let error: string | null = null;

      try {
        const response = await axios.get(endpoint.url, { timeout: 10000 });
        statusCode = response.status;
      } catch (err: any) {
        statusCode = err.response?.status || 0;
        error = err.message;
      }

      const latencyMs = Date.now() - start;

      // Save log
      await prisma.log.create({
        data: {
          endpointId: endpoint.id,
          statusCode,
          latencyMs,
          error,
        },
      });

      // Trigger alert if needed
      const isDown = statusCode === 0 || statusCode >= 500;
      const isSlow = latencyMs > endpoint.thresholdMs;

      if (isDown || isSlow) {
        await prisma.alert.create({
          data: {
            endpointId: endpoint.id,
            type: isDown ? "DOWN" : "SLOW",
          },
        });
      }
    }

    console.log("✅ Monitoring cycle complete");
  });
}
