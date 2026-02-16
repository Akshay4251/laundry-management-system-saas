-- AlterTable
ALTER TABLE "orders" ADD COLUMN "address_id" TEXT;

-- CreateIndex
CREATE INDEX "orders_address_id_idx" ON "orders"("address_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "customer_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;