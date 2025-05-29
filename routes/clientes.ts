import { PrismaClient } from "@prisma/client";
import e, { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { validaSenha } from "../utils/validaSenha";

const prisma = new PrismaClient();
const router = Router();

const clienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string(),
  senha: z.string(),
});


router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.status(200).json(clientes);
  } catch (error) {
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
  const errosSenha = validaSenha(senha);
  if (errosSenha.length > 0) {
    return res.status(400).json({ erro: errosSenha.join("; ") });
  }

  try {
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(senha, salt);

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        senha: hash,
      },
    });

    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar cliente", detalhe: error });
  }
});

router.get("/:clienteId/itens", async (req, res) => {
  const { clienteId } = req.params;

  try {
    const itens = await prisma.itemTransacao.findMany({
      where: {
        status: "FINALIZADO",
        clienteId: clienteId,
      },
      include: {
        produto: true,
        cliente: true, // <- Aqui você inclui os dados do cliente no retorno
      },
    });

    res.status(200).json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar o carrinho do cliente." });
  }
});

// GET /cliente/:id/carrinho → busca itens do carrinho com status "CARRINHO" para um cliente
router.get("/:id/carrinho", async (req, res) => {
  const { id } = req.params

  const clienteId = id; // keep as string

  if (!clienteId) {
    return res.status(400).json({ error: "ID de cliente inválido" })
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        itensTransacao: {
          where: {
            status: "CARRINHO",
          },
          include: {
            produto: true,
          },
        },
      },
    })

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" })
    }

    res.json(cliente.itensTransacao)
  } catch (error) {
    console.error("Erro ao buscar carrinho do cliente:", error)
    res.status(500).json({ error: "Erro interno ao buscar carrinho do cliente" })
  }
})

export default router;
