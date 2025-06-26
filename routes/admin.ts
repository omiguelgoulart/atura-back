import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import bcrypt from "bcrypt";
import { z } from "zod";
import { validaSenha } from "../utils/validaSenha";

const prisma = new PrismaClient();
const router = Router();

// ✅ Schema da Admin
const adminSchema = z.object({
    nome: z.string().min(1, "Nome obrigatório"),
    email: z.string().email("Email inválido"),
    senha: z.string(),
    });

// ✅ GET /admins
router.get("/", async (req, res) => {
    try {
        const admins = await prisma.admin.findMany();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar administradores" });
    }
});

// ✅ POST /admins
router.post("/", async (req, res) => {
    const valida = adminSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.format() });
    }

    const { nome, email, senha } = valida.data;

    // Verifica se o e-mail já está cadastrado
    const existente = await prisma.admin.findUnique({ where: { email } });
    if (existente) {
        return res.status(400).json({ erro: "E-mail já cadastrado no sistema" });
    }

    // Validação personalizada da senha
    const errosSenha = validaSenha(senha);
    if (errosSenha.length > 0) {
        return res.status(400).json({ erro: errosSenha.join("; ") });
    }

    try {
        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(senha, salt);

        const admin = await prisma.admin.create({
            data: {
                nome,
                email,
                senha: hash,
            },
        });

        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar administrador", detalhe: error });
    }
});

// ✅ DELETE /admins/:id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.admin.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: "Erro ao excluir administrador" });
    }
});

// ✅ PATCH /admins/:id
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const valida = adminSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.format() });
    }

    const { nome, email, senha } = valida.data;

    try {
        const updates: any = { nome, email };
        if (senha) {
            const salt = bcrypt.genSaltSync(12);
            updates.senha = bcrypt.hashSync(senha, salt);
        }

        const admin = await prisma.admin.update({
            where: { id: Number(id) },
            data: updates,
        });

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar administrador" });
    }
});

// ✅ GET /admins/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const admin = await prisma.admin.findUnique({
            where: { id: Number(id) },
        });

        if (!admin) {
            return res.status(404).json({ erro: "Administrador não encontrado" });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar administrador" });
    }
});

export default router;