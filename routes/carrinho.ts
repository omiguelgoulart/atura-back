import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()

const router = Router()

const carrinhoSchema = z.object({
  quantidade: z.number().positive(),
  produtoId: z.number(),
  clienteId: z.string().uuid(),
})

router.get("/", async (req, res) => {
  try {
    const carrinho = await prisma.carrinho.findMany({
      include: {
        produto: true,
        cliente: true
      }
    })
    res.status(200).json(carrinho)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = carrinhoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { quantidade, produtoId, clienteId } = valida.data

  try {
    const carrinho = await prisma.carrinho.create({
      data: {
        quantidade,
        produto: { connect: { id: produtoId } },
        cliente: { connect: { id: clienteId } }
      }
    })
    res.status(201).json(carrinho)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const carrinho = await prisma.carrinho.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(carrinho)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.patch("/:id", async (req, res) => {
  const { id } = req.params

  const valida = carrinhoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { quantidade, produtoId, clienteId } = valida.data

  try {
    const carrinho = await prisma.carrinho.update({
      where: { id: Number(id) },
      data: {
        quantidade,
        produto: { connect: { id: produtoId } },
        cliente: { connect: { id: clienteId } }
      }
    })
    res.status(200).json(carrinho)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router