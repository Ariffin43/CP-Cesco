-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "public"."project_status" AS ENUM ('Pending', 'Ongoing', 'Finish', 'Cancel');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."user_role" NOT NULL DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project" (
    "id" BIGSERIAL NOT NULL,
    "job_no" VARCHAR(64) NOT NULL,
    "customer" VARCHAR(256) NOT NULL,
    "project_name" VARCHAR(256) NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "public"."project_status" NOT NULL DEFAULT 'Pending',
    "pic" VARCHAR(128),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "ix_project_dates" ON "public"."project"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "ix_project_status" ON "public"."project"("status");
