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

      const hasIssue = isDown || isSlow;

      // Check for existing unresolved alert
      const existingAlert = await prisma.alert.findFirst({
        where: { endpointId: endpoint.id, resolvedAt: null },
      });

      if (hasIssue && !existingAlert) {
        await prisma.alert.create({
          data: {
            endpointId: endpoint.id,
            type: isDown ? "DOWN" : "SLOW",
          },
        });
        console.log(`🚨 New alert created for ${endpoint.name}`);
      } else if (!hasIssue && existingAlert) {
        await prisma.alert.update({
          where: { id: existingAlert.id },
          data: { resolvedAt: new Date() },
        });
        console.log(`✅ Alert resolved for ${endpoint.name}`);
      }
    }

    console.log("✅ Monitoring cycle complete");
  });
}
