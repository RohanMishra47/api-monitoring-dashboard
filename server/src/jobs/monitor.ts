import { sendAlertEmail } from "@/utils/email.js";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import cron from "node-cron";

const prisma = new PrismaClient();

// Function to clean up old logs
async function cleanupOldLogs() {
  const retentionDays = 30; // keep logs for 30 days
  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - retentionDays);

  try {
    const deleted = await prisma.log.deleteMany({
      where: { timestamp: { lt: cutOffDate } },
    });

    console.log(
      `🧹 Deleted ${deleted.count} old logs older than ${retentionDays} days`
    );
  } catch (error) {
    console.error("Error cleaning up old logs:", error);
  }
}

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

        await sendAlertEmail(
          `🚨 Alert: ${endpoint.name} is ${isDown ? "DOWN" : "SLOW"}`,
          `Endpoint: ${
            endpoint.url
          }\nStatus: ${statusCode}\nLatency: ${latencyMs}ms\nTime: ${new Date().toISOString()}`
        );
      } else if (!hasIssue && existingAlert) {
        await prisma.alert.update({
          where: { id: existingAlert.id },
          data: { resolvedAt: new Date() },
        });
        console.log(`✅ Alert resolved for ${endpoint.name}`);

        await sendAlertEmail(
          `✅ Recovery: ${endpoint.name} is back online`,
          `Endpoint: ${endpoint.url}\nRecovered at: ${new Date().toISOString()}`
        );
      }
    }

    console.log("✅ Monitoring cycle complete");
  });

  // Schedule log cleanup daily at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log(" 🧹 Starting daily log cleanup");
    await cleanupOldLogs();
  });

  console.log("📊 Monitoring started - running every minute");
  console.log("🧹 Log cleanup scheduled daily at 2 AM");
}
