/*
  Warnings:

  - The primary key for the `admins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `RespostaAvaliacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RespostaAvaliacao" DROP CONSTRAINT "RespostaAvaliacao_adminId_fkey";

-- DropForeignKey
ALTER TABLE "RespostaAvaliacao" DROP CONSTRAINT "RespostaAvaliacao_avaliacaoId_fkey";

-- AlterTable
ALTER TABLE "admins" DROP CONSTRAINT "admins_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(36),
ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "admins_id_seq";

-- DropTable
DROP TABLE "RespostaAvaliacao";

-- CreateTable
CREATE TABLE "respostasAvaliacao" (
    "id" SERIAL NOT NULL,
    "mensagem" VARCHAR(1000) NOT NULL,
    "respondidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avaliacaoId" INTEGER NOT NULL,
    "adminId" TEXT,

    CONSTRAINT "respostasAvaliacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "respostasAvaliacao" ADD CONSTRAINT "respostasAvaliacao_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "avaliacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostasAvaliacao" ADD CONSTRAINT "respostasAvaliacao_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
