/*
  Warnings:

  - You are about to drop the column `produto_id` on the `fotos` table. All the data in the column will be lost.
  - Added the required column `produtoId` to the `fotos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `fotos` DROP FOREIGN KEY `fotos_produto_id_fkey`;

-- AlterTable
ALTER TABLE `fotos` DROP COLUMN `produto_id`,
    ADD COLUMN `produtoId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `fotos` ADD CONSTRAINT `fotos_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
