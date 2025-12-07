import prisma from "../src/config/prisma_client";

async function seedEndpoints() {
  const endpoints = [
    {
      name: "Google API",
      url: "https://www.google.com",
      interval: 120,
      thresholdMs: 500,
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
