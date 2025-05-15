/*
  Warnings:

  - You are about to drop the column `data` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `statusPedido` on the `pedidos` table. All the data in the column will be lost.
  - Added the required column `date` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `pedidos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "pedidos" DROP COLUMN "data",
DROP COLUMN "statusPedido",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "STATUS" NOT NULL;
