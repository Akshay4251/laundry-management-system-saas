-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('DETERGENT', 'SOFTENER', 'BLEACH', 'PACKAGING', 'EQUIPMENT', 'CHEMICALS', 'ACCESSORIES', 'OTHER');

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "store_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "category" "InventoryCategory" NOT NULL DEFAULT 'DETERGENT',
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 10,
    "max_stock" INTEGER,
    "unit" TEXT NOT NULL DEFAULT 'pieces',
    "cost_per_unit" DECIMAL(10,2) NOT NULL,
    "supplier" TEXT,
    "supplier_phone" TEXT,
    "supplier_email" TEXT,
    "last_restocked_at" TIMESTAMP(3),
    "last_restocked_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_restock_logs" (
    "id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "previous_stock" INTEGER NOT NULL,
    "added_stock" INTEGER NOT NULL,
    "new_stock" INTEGER NOT NULL,
    "cost_per_unit" DECIMAL(10,2) NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "restocked_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_restock_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_business_id_idx" ON "inventory_items"("business_id");

-- CreateIndex
CREATE INDEX "inventory_items_store_id_idx" ON "inventory_items"("store_id");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_items_is_active_idx" ON "inventory_items"("is_active");

-- CreateIndex
CREATE INDEX "inventory_items_deleted_at_idx" ON "inventory_items"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_business_id_sku_key" ON "inventory_items"("business_id", "sku");

-- CreateIndex
CREATE INDEX "inventory_restock_logs_inventory_item_id_idx" ON "inventory_restock_logs"("inventory_item_id");

-- CreateIndex
CREATE INDEX "inventory_restock_logs_created_at_idx" ON "inventory_restock_logs"("created_at");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_restock_logs" ADD CONSTRAINT "inventory_restock_logs_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
