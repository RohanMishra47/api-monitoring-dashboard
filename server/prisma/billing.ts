import { PrismaClient } from "@prisma/client";
import { getRandomLatency } from "./logs.js";
const prisma = new PrismaClient();

async function simulateBilling() {
  const endpoints = await prisma.endpoint.findMany();

  for (const ep of endpoints) {
    let cost = 0;

    if (ep.name.includes("OpenAI")) {
      cost = 0.002 * 500;
    } else if (ep.name.includes("Stripe")) {
      cost = 0.3 * 3;
    } else {
      cost = 0.01 * getRandomLatency(); // fallback
    }

    await prisma.billing.create({
      data: {
        endpointId: ep.id,
        cost,
      },
    });
  }

  console.log("✅ Simulated billing data");
}

simulateBilling()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
