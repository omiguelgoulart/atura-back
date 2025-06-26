import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// ✅ Schema da resposta
const respostaSchema = z.object({
  mensagem: z.string().min(1, "Mensagem obrigatória"),
  adminId: z.number().optional(), // O adminId será preenchido pelo middleware verificaToken
});

// ✅ GET /respostas
router.get("/", async (req, res) => {
    try {
        const respostas = await prisma.respostaAvaliacao.findMany({
            include: { admin: true }, // Inclui os dados do admin que respondeu
        });
        res.status(200).json(respostas);
    } catch (error) {
        res.status(400).json({ erro: "Erro ao listar respostas" });
    }
});

// ✅ POST /respostas/:avaliacaoId
router.post("/:avaliacaoId", async (req, res) => {
    const valida = respostaSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.format() });
    }
    
    const { avaliacaoId } = req.params;
    const { mensagem, adminId } = valida.data;
    
    try {
        const resposta = await prisma.respostaAvaliacao.create({
        data: {
            mensagem,
            avaliacaoId: Number(avaliacaoId),
            adminId: adminId ? Number(adminId) : null, // Se adminId não for fornecido, será null
        },
        });
    
        res.status(201).json(resposta);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar resposta" });
    }
});

// ✅ GET /respostas/:avaliacaoId
router.get("/:avaliacaoId", async (req, res) => {
    const { avaliacaoId } = req.params;
    
    try {
        const respostas = await prisma.respostaAvaliacao.findMany({
        where: { avaliacaoId: Number(avaliacaoId) },
        include: { admin: true }, // Inclui os dados do admin que respondeu
        });
    
        res.status(200).json(respostas);
    } catch (error) {
        res.status(400).json({ erro: "Erro ao listar respostas" });
    }
});

// ✅ DELETE /respostas/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.respostaAvaliacao.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ erro: "Erro ao excluir resposta" });
  }
});

// ✅ PATCH /respostas/:id
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const valida = respostaSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.format() });
    }
    
    const { mensagem, adminId } = valida.data;
    
    try {
        const resposta = await prisma.respostaAvaliacao.update({
        where: { id: Number(id) },
        data: {
            mensagem,
            adminId: adminId ? Number(adminId) : null, // Se adminId não for fornecido, será null
        },
        });
    
        res.status(200).json(resposta);
    } catch (error) {
        res.status(400).json({ erro: "Erro ao atualizar resposta" });
    }
});

export default router;
