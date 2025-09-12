-- CreateEnum
CREATE TYPE "public"."contract_type" AS ENUM ('LUMPSUM', 'DAILY_RATE');

-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "add_duration" INTEGER,
ADD COLUMN     "contract_type" "public"."contract_type";

-- CreateTable
CREATE TABLE "public"."certif" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "image" BYTEA NOT NULL,

    CONSTRAINT "certif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gallery" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "image" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."machine_categories" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "desc" TEXT,
    "image" BYTEA,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."machines" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "desc" TEXT,
    "image" BYTEA,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desc" TEXT NOT NULL DEFAULT '-',
    "icon" BYTEA NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_profile" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "contact_phone" VARCHAR(100),
    "contact_whatsapp" VARCHAR(100),
    "address" TEXT,
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "social" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "company_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facilities" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "desc" TEXT,
    "gambar" BYTEA,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."machine_categories" ADD CONSTRAINT "machine_categories_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."machines" ADD CONSTRAINT "machines_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."machine_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
