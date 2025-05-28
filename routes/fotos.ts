// import {  PrismaClient } from '@prisma/client'
// import { Router } from 'express'
// import { z } from 'zod'
// import multer from 'multer'
// import { CloudinaryStorage } from 'multer-storage-cloudinary'
// import { v2 as cloudinary } from 'cloudinary'


// // Configuração do Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
//   api_key: process.env.CLOUDINARY_API_KEY || '',
//   api_secret: process.env.CLOUDINARY_API_SECRET || ''
// })

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     return {
//       folder: 'imagens_carros',
//       allowed_formats: ['jpg', 'jpeg', 'png'],
//       public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
//     }  
//   },
// })

// const upload = multer({ storage })

// const prisma = new PrismaClient()

// const router = Router()


// // Validação com Zod
// const fotoSchema = z.object({
//   descricao: z.string().min(5, {
//     message: "Descrição da Foto deve possuir, no mínimo, 5 caracteres"
//   }),
//   produtoId: z.coerce.number()
// })

// router.get("/", async (req, res) => {
//   try {
//     const fotos = await prisma.foto.findMany({
//       include: {
//         carro: true,
//       }
//     })
//     res.status(200).json(fotos)
//   } catch (error) {
//     res.status(500).json({ erro: error })
//   }
// })

// router.post("/", upload.single('imagem'), async (req, res) => {

//   const valida = fotoSchema.safeParse(req.body)
//   if (!valida.success) {
//     res.status(400).json({ erro: valida.error })
//     return
//   }

//   if (!req.file || !req.file.path) {
//     res.status(400).json(
//       {erro: "Envio da imagem é obrigatório"})
//     return
//   }

//   const { descricao, carroId } = valida.data
//   const urlFoto = req.file.path

//   try {
//     const foto = await prisma.foto.create({
//       data: { descricao, carroId, url: urlFoto }
//     })
//     res.status(201).json(foto)
//   } catch (error) {
//     res.status(400).json({ error })
//   }
// })

// export default router
