-- AlterTable
ALTER TABLE "business_settings" ADD COLUMN     "gst_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gst_percentage" DECIMAL(5,2) NOT NULL DEFAULT 18;

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "gst_number" VARCHAR(15);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "gst_amount" DECIMAL(10,2),
ADD COLUMN     "gst_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gst_percentage" DECIMAL(5,2),
ADD COLUMN     "subtotal" DECIMAL(10,2);
