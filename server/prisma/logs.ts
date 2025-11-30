import prisma from "./prisma_client.js";

function getRandomStatus() {
  const codes = [200, 200, 200, 500, 404]; //Higher chance of 200
  return codes[Math.floor(Math.random() * codes.length)]!;
}

export function getRandomLatency() {
  return Math.floor(Math.random() * 1000)!; // 0 to 999 ms
}

async function generateLogs() {
  const endpoints = await prisma.endpoint.findMany();

  for (const ep of endpoints) {
    const statusCode = getRandomStatus();
    const latencyMs = getRandomLatency();
    const error = statusCode !== 200 ? "Simulated error" : null;

    await prisma.log.create({
      data: {
        endpointId: ep.id,
        statusCode,
        latencyMs,
        error,
      },
    });
  }

  console.log("Generated synthetic logs");
}

generateLogs()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
