"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificaCodigoRecuperacao = verificaCodigoRecuperacao;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function verificaCodigoRecuperacao(req, res, next) {
    const { email, codigo } = req.body;
    if (!email || !codigo) {
        return res.status(400).json({ error: "E-mail e código são obrigatórios" });
    }
    try {
        const cliente = await prisma.cliente.findUnique({ where: { email } });
        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        if (cliente.resetToken !== codigo) {
            return res.status(400).json({ error: "Código inválido" });
        }
        if (!cliente.resetTokenExpires ||
            (0, date_fns_1.isBefore)(new Date(cliente.resetTokenExpires), new Date())) {
            return res.status(400).json({ error: "O código expirou" });
        }
        // Anexa o cliente ao body (opcional)
        req.body.cliente = cliente;
        next();
    }
    catch (error) {
        console.error("Erro na verificação de código:", error);
        res.status(500).json({ error: "Erro ao verificar o código de recuperação" });
    }
}
