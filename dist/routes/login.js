"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const enviaEmail_1 = require("../utils/enviaEmail");
const geraCodigo_1 = require("../utils/geraCodigo");
const verificaCodigoRecuperacao_1 = require("../middlewares/verificaCodigoRecuperacao");
const validaSenha_1 = require("../utils/validaSenha");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Função de login
async function autenticarCliente(email, senha) {
    const cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente)
        return null;
    const senhaCorreta = await bcrypt_1.default.compare(senha, cliente.senha);
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
        const token = jsonwebtoken_1.default.sign({
            clienteLogadoId: cliente.id,
            clienteLogadoNome: cliente.nome,
        }, process.env.JWT_KEY, { expiresIn: "1h" });
        res.status(200).json({
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            token,
        });
    }
    catch (error) {
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
        const codigo = (0, geraCodigo_1.gerarCodigoAleatorio)(); // ex: "384021"
        const expiraEm = new Date();
        expiraEm.setMinutes(expiraEm.getMinutes() + 10);
        await prisma.cliente.update({
            where: { email },
            data: {
                resetToken: codigo,
                resetTokenExpires: expiraEm,
            },
        });
        await (0, enviaEmail_1.enviaEmail)(email, cliente.nome, codigo);
        res.status(200).json({ message: "Código enviado para o e-mail" });
    }
    catch (error) {
        console.error("Erro ao processar solicitação:", error);
        res.status(500).json({ error: "Erro ao processar solicitação" });
    }
});
// Rota para redefinir a senha
router.patch("/recupera-senha", verificaCodigoRecuperacao_1.verificaCodigoRecuperacao, async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e nova senha são obrigatórios" });
    }
    const erros = (0, validaSenha_1.validaSenha)(senha);
    if (erros.length > 0) {
        return res.status(400).json({ error: erros.join("; ") });
    }
    try {
        const salt = await bcrypt_1.default.genSalt(12);
        const senhaHash = await bcrypt_1.default.hash(senha, salt);
        await prisma.cliente.update({
            where: { email },
            data: {
                senha: senhaHash,
                resetToken: null,
                resetTokenExpires: null,
            },
        });
        res.status(200).json({ message: "Senha redefinida com sucesso!" });
    }
    catch (error) {
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ error: "Erro ao redefinir senha. Tente novamente mais tarde." });
    }
});
exports.default = router;
