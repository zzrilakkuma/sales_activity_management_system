/*
  Warnings:

  - You are about to drop the column `status` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "allocation_status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "tracking_status" TEXT[] DEFAULT ARRAY['ALLOCATION_TRACKING']::TEXT[];
