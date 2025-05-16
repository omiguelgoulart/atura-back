"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const marcaSchema = zod_1.z.object({
    nome: zod_1.z.string()
});
router.get("/", async (req, res) => {
    try {
        const marcas = await prisma.marca.findMany({});
        res.status(200).json(marcas);
    }
    catch (error) {
        res.status(500).json({ erro: error });
    }
});
router.post("/", async (req, res) => {
    const valida = marcaSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { nome } = valida.data;
    try {
        const marca = await prisma.marca.create({
            data: {
                nome
            }
        });
        res.status(201).json(marca);
    }
    catch (error) {
        res.status(400).json({ error });
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const marca = await prisma.marca.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(marca);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const valida = marcaSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { nome } = valida.data;
    try {
        const marca = await prisma.marca.update({
            where: { id: Number(id) },
            data: { nome }
        });
        res.status(200).json(marca);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
exports.default = router;
