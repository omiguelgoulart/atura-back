-- AlterTable
ALTER TABLE `clientes` MODIFY `nome` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `senha` VARCHAR(191) NOT NULL,
    MODIFY `clientescol` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `fotos` MODIFY `descricao` VARCHAR(191) NOT NULL,
    MODIFY `url` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `marca` MODIFY `nome` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pedidos` MODIFY `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `produto` MODIFY `nome` VARCHAR(191) NOT NULL,
    MODIFY `descricao` VARCHAR(191) NOT NULL,
    MODIFY `categoria` VARCHAR(191) NOT NULL;
