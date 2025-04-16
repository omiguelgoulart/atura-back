import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//     {
//       emit: 'stdout',
//       level: 'error',
//     },
//     {
//       emit: 'stdout',
//       level: 'info',
//     },
//     {
//       emit: 'stdout',
//       level: 'warn',
//     },
//   ],
// })

// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })

const router = Router()

const produtoSchema = z.object({
  nome: z.string().min(2,
    { message: "Nome deve possuir, no mínimo, 2 caracteres" }),
  descricao: z.string().min(5,
    { message: "Descrição deve possuir, no mínimo, 5 caracteres" }),
  preco: z.number().positive().min(1, 
    { message: "Preço deve ser maior que zero" }),
  categoria: z.string().min(2,
    { message: "Categoria deve possuir, no mínimo, 2 caracteres" }),
  estoque: z.number().int().positive().min(1,
    { message: "Estoque deve ser maior que zero" }),
  marcaId: z.number().int().positive().min(1,
    { message: "Marca deve ser maior que zero" }),
  foto: z.string(),
  tamanho: z.number().int().positive().optional(),
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
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, descricao, preco, categoria, estoque, marcaId, foto, tamanho} = valida.data

  try {
    const produto = await prisma.produto.create({
      data: {
        nome, descricao, preco, categoria, estoque, marca_id: marcaId, foto, tamanho
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
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, descricao, preco, categoria, estoque, marcaId, foto, tamanho } = valida.data

  try {
    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        nome, descricao, preco, categoria, estoque, marca_id: marcaId, foto, tamanho
      }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  // tenta converter para número
  const termoNumero = Number(termo)

  // is Not a Number, ou seja, se não é um número: filtra por texto
  if (isNaN(termoNumero)) {
    try {
      const produtos = await prisma.produto.findMany({
        include: {
          marca: true,
        },
        where: {
          // OR: [
          //   // mode: "insensitive" - para pesquisas no PostgreSQL não diferenciarem
          //   // caracteres maiúsculas de minúsculas (MySQL, não precisa)
          //   { nome: { contains: termo, mode: "insensitive" } },
          //   { marca: { nome: { equals: termo, mode: "insensitive" } } }
          // ]
        }
      })
      res.status(200).json(produtos)
    } catch (error) {
      res.status(500).json({ erro: error })
    }
  } else {
    // Para números "pequenos", pesquisa por ano
    if (termoNumero <= 3000) {
      try {
        const produtos = await prisma.produto.findMany({
          include: {
            marca: true,
          },
          where: { preco: termoNumero }
        })
        res.status(200).json(produtos)
      } catch (error) {
        res.status(500).json({ erro: error })
      } 
      // else: para números "maiores", pesquisa por preço 
    } else {
      try {
        const produtos = await prisma.produto.findMany({
          include: {
            marca: true,
          },
          where: { preco: { lte: termoNumero } }
        })
        res.status(200).json(produtos)
      } catch (error) {
        res.status(500).json({ erro: error })
      }
    }
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id)},
      include: {
        marca: true,
        fotos: true
      }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: {
        marca: true,
        fotos: true
      }
    })
    res.status(200).json(produto)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
