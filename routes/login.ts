import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import { enviaEmail } from "../utils/enviaEmail";
import { gerarCodigoAleatorio } from "../utils/geraCodigo";
import { verificaCodigoRecuperacao } from "../middlewares/verificaCodigoRecuperacao";
import { validaSenha } from "../utils/validaSenha";

const prisma = new PrismaClient();
const router = Router();


// Rota de login
router.post("/", async (req, res) => {
  console.log("REQ BODY LOGIN:", req.body);
  const { email, senha, tipo } = req.body;

  if (!email || !senha || !tipo) {
    return res.status(400).json({ erro: "Email, senha e tipo são obrigatórios" });
  }

  try {
    if (tipo === "cliente") {
      const cliente = await prisma.cliente.findUnique({ where: { email } });
      if (!cliente || !(await bcrypt.compare(senha, cliente.senha))) {
        return res.status(401).json({ erro: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { id: cliente.id, nome: cliente.nome, tipo },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      );

      return res.json({ id: cliente.id, nome: cliente.nome, email: cliente.email, tipo, token });

    } else if (tipo === "admin") {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin || !(await bcrypt.compare(senha, admin.senha))) {
        return res.status(401).json({ erro: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { id: admin.id, nome: admin.nome, tipo },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      );

      return res.json({ id: admin.id, nome: admin.nome, email: admin.email, tipo, token });
    }

    return res.status(400).json({ erro: "Tipo inválido" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});


// Rota para solicitar recuperação de senha
router.post("/recupera-senha", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "E-mail inválido" });
  }

  try {
    const cliente = await prisma.cliente.findUnique({ where: { email } });

    if (!cliente) {
      return res.status(404).json({ error: "E-mail não encontrado" });
    }

    const codigo = gerarCodigoAleatorio(); // ex: "384021"
    const expiraEm = new Date();
    expiraEm.setMinutes(expiraEm.getMinutes() + 10);

    await prisma.cliente.update({
      where: { email },
      data: {
        resetToken: codigo,
        resetTokenExpires: expiraEm,
      },
    });

    await enviaEmail(email, cliente.nome, codigo);

    res.status(200).json({ message: "Código enviado para o e-mail" });
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    res.status(500).json({ error: "Erro ao processar solicitação" });
  }
});

// Rota para redefinir a senha
router.patch("/recupera-senha", verificaCodigoRecuperacao, async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e nova senha são obrigatórios" });
  }

  const erros = validaSenha(senha);
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join("; ") });
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    await prisma.cliente.update({
      where: { email },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.status(200).json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: "Erro ao redefinir senha. Tente novamente mais tarde." });
  }
});

export default router;
