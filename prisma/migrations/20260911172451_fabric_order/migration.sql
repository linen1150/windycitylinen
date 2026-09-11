-- AlterTable
ALTER TABLE "Fabric" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Fabric_order_idx" ON "Fabric"("order");
