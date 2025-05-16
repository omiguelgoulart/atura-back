"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const validaSenha_1 = require("../utils/validaSenha");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const clienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: zod_1.z.string(),
    senha: zod_1.z.string(),
});
router.get("/", async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany();
        res.status(200).json(clientes);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.post("/", async (req, res) => {
    const valida = clienteSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.format() });
    }
    const { nome, email, senha } = valida.data;
    // Verifica se o e-mail já está cadastrado
    const existente = await prisma.cliente.findUnique({ where: { email } });
    if (existente) {
        return res.status(400).json({ erro: "E-mail já cadastrado no sistema" });
    }
    // Validação personalizada da senha
    const errosSenha = (0, validaSenha_1.validaSenha)(senha);
    if (errosSenha.length > 0) {
        return res.status(400).json({ erro: errosSenha.join("; ") });
    }
    try {
        const salt = bcrypt_1.default.genSaltSync(12);
        const hash = bcrypt_1.default.hashSync(senha, salt);
        const cliente = await prisma.cliente.create({
            data: {
                nome,
                email,
                senha: hash,
            },
        });
        res.status(201).json(cliente);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao criar cliente", detalhe: error });
    }
});
exports.default = router;
