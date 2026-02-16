-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "app_registered_at" TIMESTAMP(3),
ADD COLUMN     "expo_push_token" TEXT,
ADD COLUMN     "is_app_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "push_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_refresh_tokens" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device_info" TEXT,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_operating_hours" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "operating_days" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6]::INTEGER[],
    "time_slots" JSONB NOT NULL DEFAULT '[{"id":"morning","label":"Morning","startTime":"09:00","endTime":"12:00"},{"id":"afternoon","label":"Afternoon","startTime":"12:00","endTime":"15:00"},{"id":"evening","label":"Evening","startTime":"15:00","endTime":"18:00"},{"id":"late_evening","label":"Late Evening","startTime":"18:00","endTime":"21:00"}]',
    "min_pickup_hours_advance" INTEGER NOT NULL DEFAULT 2,
    "max_pickup_days_advance" INTEGER NOT NULL DEFAULT 7,
    "allow_customer_app" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_refresh_tokens_token_key" ON "customer_refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "customer_refresh_tokens_customer_id_idx" ON "customer_refresh_tokens"("customer_id");

-- CreateIndex
CREATE INDEX "customer_refresh_tokens_token_idx" ON "customer_refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "business_operating_hours_business_id_key" ON "business_operating_hours"("business_id");

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_refresh_tokens" ADD CONSTRAINT "customer_refresh_tokens_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_operating_hours" ADD CONSTRAINT "business_operating_hours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
