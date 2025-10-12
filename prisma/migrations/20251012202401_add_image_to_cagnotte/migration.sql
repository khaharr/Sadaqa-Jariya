/*
  Warnings:

  - You are about to drop the `Cagnottes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Cagnottes";

-- CreateTable
CREATE TABLE "Cagnotte" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "lien" TEXT NOT NULL,
    "image" TEXT,
    "category" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cagnotte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cagnotte_lien_key" ON "Cagnotte"("lien");
