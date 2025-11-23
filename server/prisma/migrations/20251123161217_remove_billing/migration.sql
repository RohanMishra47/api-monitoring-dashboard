/*
  Warnings:

  - You are about to drop the `Billing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_endpointId_fkey";

-- DropForeignKey
ALTER TABLE "Billing" DROP CONSTRAINT "Billing_endpointId_fkey";

-- DropForeignKey
ALTER TABLE "Billing" DROP CONSTRAINT "Billing_userId_fkey";

-- DropForeignKey
ALTER TABLE "Endpoint" DROP CONSTRAINT "Endpoint_userId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_endpointId_fkey";

-- DropTable
DROP TABLE "Billing";

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
