-- AlterTable
ALTER TABLE "Billing" ADD COLUMN     "billingType" TEXT,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "unitCost" DOUBLE PRECISION;
