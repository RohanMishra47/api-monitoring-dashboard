import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const COST_PER_CHECK = 0.005; // cost per monitoring request

// Main billing processing function
async function processBilling() {
  // Fetch all endpoints and their associated user
  const endpointsWithUser = await prisma.endpoint.findMany({
    select: { id: true, userId: true },
  });

  // Create a map for quick user lookup: { endpointId: userId }
  const endpointUserMap = endpointsWithUser.reduce<
    Record<string, string | null>
  >((map, ep) => {
    map[ep.id] = ep.userId;
    return map;
  }, {});

  // Aggregate total *monitoring check* logs
  const usageStats = await prisma.log.groupBy({
    by: ["endpointId"],
    _count: { endpointId: true },
  });

  // For each endpoint's usage, create a billing record
  for (const usage of usageStats) {
    const checkCount = usage._count.endpointId;
    const totalCost = checkCount * COST_PER_CHECK;
    const userId = endpointUserMap[usage.endpointId];

    if (!userId) {
      console.warn(
        `Skipping billing for endpoint ${usage.endpointId}: No user found.`
      );
      continue;
    }

    // 3. Create the Billing record
    await prisma.billing.create({
      data: {
        userId: userId, // Link to the user
        endpointId: usage.endpointId, // Keep for context
        billingType: "MONITORING_CHECK",
        quantity: checkCount,
        unitCost: COST_PER_CHECK,
        cost: totalCost,
      },
    });
  }

  console.log("✅ Platform usage billing run complete");
}

processBilling()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
