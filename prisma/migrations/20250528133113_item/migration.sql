-- DropForeignKey
ALTER TABLE "itensTransacao" DROP CONSTRAINT "itensTransacao_produtoId_fkey";

-- AlterTable
ALTER TABLE "itensTransacao" ALTER COLUMN "produtoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "itensTransacao" ADD CONSTRAINT "itensTransacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
