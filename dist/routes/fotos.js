"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const cloudinary_1 = require("cloudinary");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Configuração do Cloudinary
cloudinary_1.v2.config({
    cloud_name: '',
    api_key: '',
    api_secret: ''
});
// Validação com Zod
const fotoSchema = zod_1.z.object({
    descricao: zod_1.z.string().min(5, {
        message: "Descrição da Foto deve possuir, no mínimo, 5 caracteres"
    }),
    produtoId: zod_1.z.coerce.number()
});
// ROTA GET - Listar fotos
router.get("/", async (req, res) => {
    try {
        const fotos = await prisma.fotos.findMany({
            include: { produto: true }
        });
        res.status(200).json(fotos);
    }
    catch (error) {
        res.status(500).json({ erro: error instanceof Error ? error.message : String(error) });
    }
});
// ROTA POST - Upload de imagem com Cloudinary
router.post("/", async (req, res) => {
    const valida = fotoSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.format() });
    }
    if (!req.files || !('imagem' in req.files)) {
        return res.status(400).json({ erro: "Envio da imagem é obrigatório" });
    }
    const imagem = req.files.imagem;
    const { descricao, produtoId } = valida.data;
    try {
        const resultado = await cloudinary_1.v2.uploader.upload(imagem.tempFilePath, {
            folder: 'imagens_carros'
        });
        const foto = await prisma.fotos.create({
            data: {
                descricao,
                produtoId,
                url: resultado.secure_url
            }
        });
        res.status(201).json(foto);
    }
    catch (error) {
        console.error("ERRO AO CRIAR FOTO:");
        console.dir(error, { depth: null });
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
