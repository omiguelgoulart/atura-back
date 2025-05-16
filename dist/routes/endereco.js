"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const enderecoSchema = zod_1.z.object({
    rua: zod_1.z.string().min(2, { message: "Rua deve possuir, no mínimo, 2 caracteres" }),
    numero: zod_1.z.string().min(1, { message: "Número deve possuir, no mínimo, 1 caracteres" }),
    cidade: zod_1.z.string().min(2, { message: "Cidade deve possuir, no mínimo, 2 caracteres" }),
    estado: zod_1.z.string().min(2, { message: "Estado deve possuir, no mínimo, 2 caracteres" }),
    cep: zod_1.z.string().min(8, { message: "CEP deve possuir, no mínimo, 8 caracteres" }),
    complemento: zod_1.z.string().optional(),
});
router.get("/", async (req, res) => {
    try {
        const enderecos = await prisma.endereco.findMany({
            include: {
                cliente: true,
            }
        });
        res.status(200).json(enderecos);
    }
    catch (error) {
        res.status(500).json({ erro: error });
    }
});
router.post("/", async (req, res) => {
    const valida = enderecoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { rua, numero, cidade, estado, cep, complemento, clienteId } = { ...valida.data, clienteId: req.body.clienteId };
    if (!clienteId) {
        res.status(400).json({ erro: "clienteId é obrigatório" });
        return;
    }
    try {
        const endereco = await prisma.endereco.create({
            data: {
                rua,
                numero,
                cidade,
                estado,
                cep,
                complemento,
                cliente: {
                    connect: { id: clienteId }
                }
            }
        });
        res.status(201).json(endereco);
    }
    catch (error) {
        res.status(400).json({ error });
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const endereco = await prisma.endereco.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(endereco);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const valida = enderecoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { rua, numero, cidade, estado, cep, complemento } = valida.data;
    try {
        const endereco = await prisma.endereco.update({
            where: { id: Number(id) },
            data: {
                rua,
                numero,
                cidade,
                estado,
                cep,
                complemento
            }
        });
        res.status(200).json(endereco);
    }
    catch (error) {
        res.status(400).json({ erro: error });
    }
});
exports.default = router;
