import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'
import { UploadedFile } from 'express-fileupload'

const prisma = new PrismaClient()

const router = Router()

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: '',
  api_key: '',
  api_secret: ''
})

// Validação com Zod
const fotoSchema = z.object({
  descricao: z.string().min(5, {
    message: "Descrição da Foto deve possuir, no mínimo, 5 caracteres"
  }),
  produtoId: z.coerce.number()
})

// ROTA GET - Listar fotos
router.get("/", async (req, res) => {
  try {
    const fotos = await prisma.fotos.findMany({
      include: { produto: true }
    })
    res.status(200).json(fotos)
  } catch (error) {
    res.status(500).json({ erro: error instanceof Error ? error.message : String(error) })
  }
})

// ROTA POST - Upload de imagem com Cloudinary
router.post("/", async (req, res) => {
  const valida = fotoSchema.safeParse(req.body)

  if (!valida.success) {
    return res.status(400).json({ erro: valida.error.format() })
  }

  if (!req.files || !('imagem' in req.files)) {
    return res.status(400).json({ erro: "Envio da imagem é obrigatório" })
  }

  const imagem = req.files.imagem as UploadedFile
  const { descricao, produtoId } = valida.data

  try {
    const resultado = await cloudinary.uploader.upload(imagem.tempFilePath, {
      folder: 'imagens_carros'
    })

    const foto = await prisma.fotos.create({
      data: {
        descricao,
        produtoId,
        url: resultado.secure_url
      }
    })

    res.status(201).json(foto)
  } catch (error) {
    console.error("ERRO AO CRIAR FOTO:")
    console.dir(error, { depth: null })
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

export default router
