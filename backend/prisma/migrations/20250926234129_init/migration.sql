-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" INTEGER NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "public"."Cliente"("email");
