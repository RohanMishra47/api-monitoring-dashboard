import "dotenv/config";
import prisma from "./prisma_client.js";

async function test() {
  try {
    console.log("Connecting...");
    const result = await prisma.$queryRaw`SELECT NOW();`;
    console.log("Success:", result);
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
