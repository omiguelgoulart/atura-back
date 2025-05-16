"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviaEmail = enviaEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function enviaEmail(email, nome, codigo) {
    const transporter = nodemailer_1.default.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mensagem = `
<h2 style="color: #333;">Olá, ${nome}!</h2>

<p>Recebemos uma solicitação para redefinição da sua senha na <strong>Atura</strong>.</p>

<p>Utilize o código abaixo para continuar com a recuperação da sua conta:</p>

<p style="font-size: 24px; font-weight: bold; color: #d63384;">${codigo}</p>

<p>Este código é válido por <strong>10 minutos</strong>.</p>

<p>Se você não solicitou essa recuperação, pode ignorar este e-mail com segurança. Sua conta permanecerá protegida.</p>

<hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-size: 14px; color: #666;">
Precisa de ajuda? Fale com nossa equipe pelo e-mail: 
<a href="mailto:suporte@atura.com" style="color: #d63384;">suporte@atura.com</a>
</p>

<p>Com carinho,</p>
<p><strong>Equipe Atura • Perfumes que marcam</strong></p>
`;
    try {
        const info = await transporter.sendMail({
            from: '"Ternos Avenida" <no-reply@beautyavenida.com>',
            to: email,
            subject: "Recuperação de Senha",
            html: mensagem,
        });
        console.log("Mensagem enviada: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error("Erro ao enviar o e-mail: ", error);
        return { success: false, error };
    }
}
exports.default = enviaEmail;
