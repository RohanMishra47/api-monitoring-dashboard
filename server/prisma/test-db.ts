import "dotenv/config";
import prisma from "../src/config/prisma_client";

async function fixEndpoints() {
  try {
    await prisma.$connect();

    const userId = "382b915f-4521-4817-a6e9-6d039f46f5cc";

    // Update all endpoints with null userId to belong to this user
    const result = await prisma.endpoint.updateMany({
      where: { userId: null },
      data: { userId },
    });

    console.log(
      `✅ Updated ${result.count} endpoints to belong to user ${userId}`
    );

    // Verify
    const endpoints = await prisma.endpoint.findMany({
      where: { userId },
      select: { id: true, name: true, url: true, userId: true },
    });

    console.log("\n📋 Endpoints now assigned to your user:");
    console.table(endpoints);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixEndpoints();
