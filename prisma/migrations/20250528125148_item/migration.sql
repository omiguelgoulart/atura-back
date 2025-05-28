/*
  Warnings:

  - You are about to drop the `itens_transacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "itens_transacao" DROP CONSTRAINT "itens_transacao_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "itens_transacao" DROP CONSTRAINT "itens_transacao_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "itens_transacao" DROP CONSTRAINT "itens_transacao_produtoId_fkey";

-- DropTable
DROP TABLE "itens_transacao";

-- CreateTable
CREATE TABLE "itensTransacao" (
    "id" SERIAL NOT NULL,
    "status" "STATUS_ITEM" NOT NULL DEFAULT 'CARRINHO',
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "pedidoId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itensTransacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "itensTransacao" ADD CONSTRAINT "itensTransacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensTransacao" ADD CONSTRAINT "itensTransacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensTransacao" ADD CONSTRAINT "itensTransacao_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
