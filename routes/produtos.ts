import { PrismaClient, CategoriaProduto } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const produtoSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve possuir, no mínimo, 2 caracteres" }),
  descricao: z.string().min(5, { message: "Descrição deve possuir, no mínimo, 5 caracteres" }),
  preco: z.number().positive().min(1, { message: "Preço deve ser maior que zero" }),
  categoria: z.nativeEnum(CategoriaProduto),
  estoque: z.number().int().positive().min(1, { message: "Estoque deve ser maior que zero" }),
  marcaId: z.number().int().positive().min(1, { message: "Marca deve ser maior que zero" }),
  foto: z.string(),
  volumeMl: z.number().int().positive().optional(),
})

router.get("/", async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        marca: true,
        fotos: true
      }
    })
    res.status(200).json(produtos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = produtoSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ erro: valida.error })
  }

  const { nome, descricao, preco, categoria, estoque, marcaId, foto, volumeMl } = valida.data

  try {
    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco,
        categoria,
        estoque,
        marca_id: marcaId,
        foto,
        volumeMl,
      }
    })
    res.status(201).json(produto)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const produto = await prisma.produto.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.patch("/:id", async (req, res) => {
  const { id } = req.params

  const valida = produtoSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ erro: valida.error })
  }

  const { nome, descricao, preco, categoria, estoque, marcaId, foto, volumeMl } = valida.data

  try {
    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        preco,
        categoria,
        estoque,
        marca_id: marcaId,
        foto,
        volumeMl,
      }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params
  const termoNumero = Number(termo)

  try {
    let produtos = []

    if (!isNaN(termoNumero)) {
      produtos = termoNumero <= 3000
        ? await prisma.produto.findMany({ where: { preco: termoNumero }, include: { marca: true } })
        : await prisma.produto.findMany({ where: { preco: { lte: termoNumero } }, include: { marca: true } })
    } else {
      produtos = await prisma.produto.findMany({
        where: {
          OR: [
            { nome: { contains: termo, mode: "insensitive" } },
            { descricao: { contains: termo, mode: "insensitive" } },
            { marca: { nome: { contains: termo, mode: "insensitive" } } }
          ]
        },
        include: { marca: true },
      })
    }

    res.status(200).json(produtos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/produtos/filtro", async (req, res) => {
  const { marca, tipo, precoMin, precoMax } = req.query

  try {
    let categoriaValida: CategoriaProduto | undefined = undefined

    if (tipo && typeof tipo === 'string' && Object.values(CategoriaProduto).includes(tipo as CategoriaProduto)) {
      categoriaValida = tipo as CategoriaProduto
    }

    const produtos = await prisma.produto.findMany({
      include: { marca: true },
      where: {
        ...(marca && { marca_id: Number(marca) }),
        ...(categoriaValida && { categoria: categoriaValida }),
        ...(precoMin && { preco: { gte: Number(precoMin) } }),
        ...(precoMax && { preco: { lte: Number(precoMax) } }),
      },
    })

    res.status(200).json(produtos)
  } catch (error) {
    console.error("Erro ao filtrar produtos:", error)
    res.status(500).json({ erro: error })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: {
        marca: true,
        fotos: true,
        avaliacao: {
          include: {
            cliente: true
          }
        }
      }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
