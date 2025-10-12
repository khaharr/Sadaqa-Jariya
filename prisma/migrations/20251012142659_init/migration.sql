-- CreateTable
CREATE TABLE "Cagnottes" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "lien" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cagnottes_pkey" PRIMARY KEY ("id")
);
