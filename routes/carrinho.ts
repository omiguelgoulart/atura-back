import { PrismaClient, STATUS_ITEM } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const carrinhoSchema = z.object({
  quantidade: z.number().positive(),
  produtoId: z.number(),
  clienteId: z.string().uuid()
})


// ✅ GET - Itens no carrinho (status = CARRINHO)
router.get("/:clienteId/itens", async (req, res) => {
  const { clienteId } = req.params

  try {
    const itensCarrinho = await prisma.itemTransacao.findMany({
      where: {
        clienteId,
        status: STATUS_ITEM.CARRINHO
      },
      include: {
        produto: true
      }
    })
    res.status(200).json(itensCarrinho)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar carrinho", detalhes: error })
  }
})

// ✅ POST - Adicionar item ao carrinho
router.post("/", async (req, res) => {
  const { produtoId, quantidade, clienteId } = req.body

  if (!clienteId || !produtoId || !quantidade) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" })
  }

  try {
    // Verifica se o cliente existe
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" })
    }

    // Verifica se o produto existe
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } })
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" })
    }

    // Adiciona ao carrinho (ou atualiza quantidade, se já existir)
    const carrinhoExistente = await prisma.itemTransacao.findFirst({
      where: { clienteId, produtoId },
    })

    if (carrinhoExistente) {
      await prisma.itemTransacao.update({
        where: { id: carrinhoExistente.id },
        data: { quantidade: carrinhoExistente.quantidade + quantidade },
      })
    } else {
      await prisma.itemTransacao.create({
        data: { 
          clienteId, 
          produtoId, 
          quantidade, 
          preco_unitario: produto.preco // Adiciona o preço unitário do produto
        },
      })
    }

    return res.status(200).json({ message: "Produto adicionado ao carrinho" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Erro ao adicionar ao carrinho" })
  }
})

// ✅ DELETE - Remover item do carrinho
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const item = await prisma.itemTransacao.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(item)
  } catch (error) {
    res.status(400).json({ erro: "Erro ao remover item", detalhes: error })
  }
})

// ✅ PATCH - Atualizar item do carrinho
router.patch("/:id", async (req, res) => {
  const { id } = req.params

  const valida = carrinhoSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ erro: valida.error })
  }

  const { quantidade, produtoId, clienteId } = valida.data

  try {
    const item = await prisma.itemTransacao.update({
      where: { id: Number(id) },
      data: {
        quantidade,
        produtoId,
        clienteId
      }
    })
    res.status(200).json(item)
  } catch (error) {
    res.status(400).json({ erro: "Erro ao atualizar item", detalhes: error })
  }
})


router.get("/car/:clienteId/itens", async (req, res) => {
  const { clienteId } = req.params;

  try {
    const itens = await prisma.itemTransacao.findMany({
      where: {
        status: "CARRINHO",
        clienteId: clienteId,
      },
      include: {
        produto: true,
        cliente: true, // <- Aqui você inclui os dados do cliente no retorno
      },
    });

    res.status(200).json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar o carrinho do cliente." });
  }
});


export default router
