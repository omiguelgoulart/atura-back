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

// Função de login
async function autenticarCliente(email: string, senha: string) {
  const cliente = await prisma.cliente.findUnique({ where: { email } });
  if (!cliente) return null;

  const senhaCorreta = await bcrypt.compare(senha, cliente.senha);
  return senhaCorreta ? cliente : null;
}

// Rota de login
router.post("/", async (req, res) => {
  const { email, senha } = req.body;
  const mensagemPadrao = "Login ou senha incorretos";

  if (!email || !senha) {
    return res.status(400).json({ erro: mensagemPadrao });
  }

  try {
    const cliente = await autenticarCliente(email, senha);

    if (!cliente) {
      return res.status(400).json({ erro: mensagemPadrao });
    }

    const token = jwt.sign(
      {
        clienteLogadoId: cliente.id,
        clienteLogadoNome: cliente.nome,
      },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      token,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ erro: "Erro interno no servidor" });
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
