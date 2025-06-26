import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { date, z } from 'zod'

const prisma = new PrismaClient()

const router = Router()

const avaliacaoSchema = z.object({
    nota: z.number().min(1).max(5),
    comentario: z.string().optional(),
    produtoId: z.number(),
    clienteId: z.string().uuid(),
  
})

router.get("/", async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      include: {
        produto: true,
        cliente: true,
        respostas: {
          include: {
            admin: {
              select: { nome: true }
            }
          },
          orderBy: {
            respondidoEm: "asc"
          }
        }
      }
    });
    res.status(200).json(avaliacoes);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

router.post("/", async (req, res) => {

    const valida = avaliacaoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nota, comentario, produtoId, clienteId } = valida.data

    try {
        const avaliacao = await prisma.avaliacao.create({
            data: {
                nota,
                comentario,
                produto: { connect: { id: produtoId } },
                cliente: { connect: { id: clienteId } }
            }
        })
        res.status(201).json(avaliacao)
    } catch (error) {
        res.status(400).json({ error })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const avaliacao = await prisma.avaliacao.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(avaliacao)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.patch("/:id", async (req, res) => {
    const { id } = req.params

    const valida = avaliacaoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nota, comentario, produtoId, clienteId } = valida.data

    try {
        const avaliacao = await prisma.avaliacao.update({
            where: { id: Number(id) },
            data: {
                nota,
                comentario,
                produto: { connect: { id: produtoId } },
                cliente: { connect: { id: clienteId } }
            }
        })
        res.status(200).json(avaliacao)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.get("/:produtoId/produto", async (req, res) => {
    const { produtoId } = req.params

    try {
        const avaliacoes = await prisma.avaliacao.findMany({
            where: { produtoId: Number(produtoId) },
            include: {
                produto: true,
                cliente: true
            }
        })
        res.status(200).json(avaliacoes)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})


export default router