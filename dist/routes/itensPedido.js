"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const itemSchema = zod_1.z.object({
    quantidade: zod_1.z.number().positive(),
    preco_unitario: zod_1.z.number().positive(),
});
async function diminuirEstoqueProduto(produtoId, quantidade) {
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) {
        throw new Error('Produto não encontrado');
    }
    if (produto.estoque < quantidade) {
        throw new Error('Estoque insuficiente');
    }
    await prisma.produto.update({
        where: { id: produtoId },
        data: { estoque: produto.estoque - quantidade }
    });
}
async function aumentarEstoqueProduto(produtoId, quantidade) {
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) {
        throw new Error('Produto não encontrado');
    }
    await prisma.produto.update({
        where: { id: produtoId },
        data: { estoque: produto.estoque + quantidade }
    });
}
router.get("/", async (req, res) => {
    try {
        const itensPedido = await prisma.itemPedido.findMany({
            include: {
                produto: true,
                pedido: true
            }
        });
        res.status(200).json(itensPedido);
    }
    catch (error) {
        res.status(500).json({ erro: error });
    }
});
router.post("/", async (req, res) => {
    const valida = itemSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { quantidade, preco_unitario } = valida.data;
    try {
        // Diminui o estoque antes de criar o itemPedido
        await diminuirEstoqueProduto(req.body.produtoId, quantidade);
        const itemPedido = await prisma.itemPedido.create({
            data: {
                quantidade,
                preco_unitario,
                produto: {
                    connect: { id: req.body.produtoId }
                },
                pedido: {
                    connect: { id: req.body.pedidoId }
                }
            }
        });
        res.status(201).json(itemPedido);
    }
    catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : error });
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Busca o itemPedido antes de deletar para recuperar produtoId e quantidade
        const itemPedido = await prisma.itemPedido.findUnique({
            where: { id: Number(id) }
        });
        if (!itemPedido) {
            return res.status(404).json({ erro: "Item do pedido não encontrado" });
        }
        // Aumenta o estoque do produto relacionado
        await aumentarEstoqueProduto(itemPedido.produtoId, itemPedido.quantidade);
        // Deleta o itemPedido
        const deletedItem = await prisma.itemPedido.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(deletedItem);
    }
    catch (error) {
        res.status(400).json({ erro: error instanceof Error ? error.message : error });
    }
});
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const valida = itemSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { quantidade, preco_unitario } = valida.data;
    try {
        // Busca o itemPedido antes de atualizar para recuperar produtoId e quantidade
        const itemPedido = await prisma.itemPedido.findUnique({
            where: { id: Number(id) }
        });
        if (!itemPedido) {
            return res.status(404).json({ erro: "Item do pedido não encontrado" });
        }
        // Aumenta o estoque do produto relacionado
        await aumentarEstoqueProduto(itemPedido.produtoId, itemPedido.quantidade);
        // Diminui o estoque do novo produto relacionado
        await diminuirEstoqueProduto(req.body.produtoId, quantidade);
        // Atualiza o itemPedido
        const updatedItem = await prisma.itemPedido.update({
            where: { id: Number(id) },
            data: {
                quantidade,
                preco_unitario,
                produto: {
                    connect: { id: req.body.produtoId }
                },
                pedido: {
                    connect: { id: req.body.pedidoId }
                }
            }
        });
        res.status(200).json(updatedItem);
    }
    catch (error) {
        res.status(400).json({ erro: error instanceof Error ? error.message : error });
    }
});
exports.default = router;
