import { PrismaClient } from "@prisma/client";
import { Router } from "express";
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

export default router;
