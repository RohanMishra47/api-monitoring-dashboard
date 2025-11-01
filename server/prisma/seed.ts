import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedEndpoints() {
  const endpoints = [
    {
      name: "OpenAI API",
      url: "https://mock.openai.com/v1",
      interval: 60,
      thresholdMs: 500,
    },
    {
      name: "Stripe API",
      url: "https://mock.stripe.com/v1",
      interval: 120,
      thresholdMs: 300,
    },
    {
      name: "Weather API",
      url: "https://mock.weather.com/data",
      interval: 180,
      thresholdMs: 700,
    },
  ];

  for (const ep of endpoints) {
    await prisma.endpoint.create({ data: ep });
  }

  console.log("Seeded mock endpoints.");
}

seedEndpoints()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
