"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//     {
//       emit: 'stdout',
//       level: 'error',
//     },
//     {
//       emit: 'stdout',
//       level: 'info',
//     },
//     {
//       emit: 'stdout',
//       level: 'warn',
//     },
//   ],
// })
// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })
const router = (0, express_1.Router)();
const pedidoSchema = zod_1.z.object({
    date: zod_1.z.string().optional(),
    status: zod_1.z.enum([
        "PENDENTE",
        "PROCESSANDO",
        "ENVIADO",
        "ENTREGUE",
        "CANCELADO",
    ]),
    total: zod_1.z.number().positive(),
    clienteId: zod_1.z.string().uuid(),
    enderecoId: zod_1.z.number(),
    itemPedido: zod_1.z.array(zod_1.z.object({
        produtoId: zod_1.z.number(),
        quantidade: zod_1.z.number().positive(),
        preco_unitario: zod_1.z.number().positive(),
    })),
});
router.get("/", async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            include: {
                cliente: true,
                endereco: true,
                itemPedido: {
                    include: { produto: true },
                },
            },
        });
        res.status(200).json(pedidos);
    }
    catch (error) {
        res.status(500).json({ erro: error });
    }
});
router.post("/", async (req, res) => {
    const valida = pedidoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { date, status, total, clienteId, enderecoId, itemPedido } = valida.data;
    try {
        const data = {
            date: date ? new Date(Date.parse(date)) : new Date(),
            status,
            total,
            cliente: { connect: { id: clienteId } },
            endereco: { connect: { id: enderecoId } },
            itemPedido: {
                create: itemPedido.map((item) => ({
                    produto: { connect: { id: item.produtoId } },
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                })),
            },
        };
        if (date) {
            data.date = new Date(Date.parse(date));
        }
        const pedido = await prisma.pedido.create({ data });
        res.status(201).json(pedido);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const pedido = await prisma.pedido.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(200).json(pedido);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
router.patch("/:id", async (req, res) => {
    const valida = pedidoSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.format() });
    }
    const { date, status, total, clienteId, enderecoId, itemPedido } = valida.data;
    try {
        // remover os itens anteriores (opcional, dependendo da sua lógica)
        await prisma.itemPedido.deleteMany({
            where: { pedidoId: Number(req.params.id) },
        });
        const data = {
            status,
            total,
            cliente: { connect: { id: clienteId } },
            endereco: { connect: { id: enderecoId } },
            itemPedido: {
                create: itemPedido.map((item) => ({
                    produto: { connect: { id: item.produtoId } },
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                })),
            },
        };
        if (date) {
            data.date = new Date(Date.parse(date));
        }
        const pedido = await prisma.pedido.update({
            where: { id: Number(req.params.id) },
            data,
        });
        res.status(200).json(pedido);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
exports.default = router;
