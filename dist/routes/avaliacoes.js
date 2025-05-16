"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const avaliacaoSchema = zod_1.z.object({
    nota: zod_1.z.number().min(1).max(5),
    comentario: zod_1.z.string().optional(),
    date: zod_1.z.string(),
    produtoId: zod_1.z.number(),
    clienteId: zod_1.z.string().uuid(),
});
router.get("/", async (req, res) => {
    try {
        const avaliacoes = await prisma.avaliacao.findMany({
            include: {
                produto: true,
                cliente: true
            }
        });
        res.status(200).json(avaliacoes);
    }
    catch (error) {
        res.status(500).json({ erro: error });
    }
});
router.post("/", async (req, res) => {
    const valida = avaliacaoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { nota, comentario, date, produtoId, clienteId } = valida.data;
    try {
        const avaliacao = await prisma.avaliacao.create({
            data: {
                nota,
                comentario,
                date: new Date(Date.parse(date)),
                produto: { connect: { id: produtoId } },
                cliente: { connect: { id: clienteId } }
            }
        });
        res.status(201).json(avaliacao);
    }
    catch (error) {
        res.status(400).json({ error });
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const avaliacao = await prisma.avaliacao.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(avaliacao);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const valida = avaliacaoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { nota, comentario, date, produtoId, clienteId } = valida.data;
    try {
        const avaliacao = await prisma.avaliacao.update({
            where: { id: Number(id) },
            data: {
                nota,
                comentario,
                date: new Date(Date.parse(date)),
                produto: { connect: { id: produtoId } },
                cliente: { connect: { id: clienteId } }
            }
        });
        res.status(200).json(avaliacao);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
exports.default = router;
