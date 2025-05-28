import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

const prisma = new PrismaClient();

const router = Router();

const itemSchema = z.object({
  status: z.enum(["CARRINHO", "PEDIDO", "FINALIZADO"]),
  quantidade: z.number().positive(),
  preco_unitario: z.number().positive(),
  clienteId: z.string().uuid(),
  produtoId: z.number().optional(),
  pedidoId: z.number().optional().nullable(),
});

async function diminuirEstoqueProduto(produtoId: number, quantidade: number) {
  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) {
    throw new Error("Produto não encontrado");
  }
  if (produto.estoque < quantidade) {
    throw new Error("Estoque insuficiente");
  }
  await prisma.produto.update({
    where: { id: produtoId },
    data: { estoque: produto.estoque - quantidade },
  });
}

async function aumentarEstoqueProduto(produtoId: number, quantidade: number) {
  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) {
    throw new Error("Produto não encontrado");
  }
  await prisma.produto.update({
    where: { id: produtoId },
    data: { estoque: produto.estoque + quantidade },
  });
}

router.get("/", async (req, res) => {
  try {
    const itensPedido = await prisma.itemTransacao.findMany({
      include: {
        produto: true,
        pedido: true,
      },
    });
    res.status(200).json(itensPedido);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

router.post("/", async (req, res) => {
  const valida = itemSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  const {
    status,
    quantidade,
    preco_unitario,
    clienteId,
    produtoId,
    pedidoId, // pode vir undefined ou null
  } = valida.data;

  try {
    if (typeof produtoId !== "number") {
      res.status(400).json({ erro: "produtoId é obrigatório e deve ser um número" });
      return;
    }
    await diminuirEstoqueProduto(produtoId, quantidade);

    const data: any = {
      status,
      quantidade,
      preco_unitario,
      produto: { connect: { id: produtoId } },
      cliente: { connect: { id: clienteId } },
    };

    // Só conecta o pedido se ele foi enviado
    if (pedidoId) {
      data.pedido = { connect: { id: pedidoId } };
    }

    const itemPedido = await prisma.itemTransacao.create({ data });

    res.status(201).json(itemPedido);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : error,
    });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Busca o itemPedido antes de deletar para recuperar produtoId e quantidade
    const itemPedido = await prisma.itemTransacao.findUnique({
      where: { id: Number(id) },
    });

    if (!itemPedido) {
      return res.status(404).json({ erro: "Item do pedido não encontrado" });
    }

    // Aumenta o estoque do produto relacionado
    if (itemPedido.produtoId !== null) {
      await aumentarEstoqueProduto(itemPedido.produtoId, itemPedido.quantidade);
    } else {
      return res.status(400).json({ erro: "produtoId do item do pedido é nulo" });
    }

    // Deleta o itemPedido
    const deletedItem = await prisma.itemTransacao.delete({
      where: { id: Number(id) },
    });

    res.status(200).json(deletedItem);
  } catch (error) {
    res
      .status(400)
      .json({ erro: error instanceof Error ? error.message : error });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  const valida = itemSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  const { quantidade, preco_unitario } = valida.data;

  try {
    // Busca o itemPedido antes de atualizar para recuperar produtoId e quantidade
    const itemPedido = await prisma.itemTransacao.findUnique({
      where: { id: Number(id) },
    });

    if (!itemPedido) {
      return res.status(404).json({ erro: "Item do pedido não encontrado" });
    }

    // Aumenta o estoque do produto relacionado
    if (itemPedido.produtoId !== null) {
      await aumentarEstoqueProduto(itemPedido.produtoId, itemPedido.quantidade);
    } else {
      return res.status(400).json({ erro: "produtoId do item do pedido é nulo" });
    }

    // Diminui o estoque do novo produto relacionado
    await diminuirEstoqueProduto(req.body.produtoId, quantidade);

    // Atualiza o itemPedido
    const updatedItem = await prisma.itemTransacao.update({
      where: { id: Number(id) },
      data: {
        quantidade,
        preco_unitario,
        produto: {
          connect: { id: req.body.produtoId },
        },
        pedido: {
          connect: { id: req.body.pedidoId },
        },
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    res
      .status(400)
      .json({ erro: error instanceof Error ? error.message : error });
  }
});



router.get("/carrinho/:clienteId/itens", async (req, res) => {
  const { clienteId } = req.params
  // const { id } = req.params

  try {
    const itens = await prisma.itemTransacao.findMany({
      where: {
        status: "CARRINHO",
        clienteId,
      },
      include: {
        produto: true,
      },
    })
    res.json(itens)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar itens do carrinho." })
  }
})

// GET /itens-transacao/pedido/:clienteId
router.get("/pedido", async (req, res) => {
//   const { clienteId } = req.params

  try {
    const itens = await prisma.itemTransacao.findMany({
      where: {
        status: "PEDIDO",
        // clienteId,
      },
      include: {
        produto: true,
      },
    })
    res.json(itens)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar itens do pedido." })
  }
})

// GET /itens-transacao/finalizado/:clienteId
router.get("/finalizado", async (req, res) => {
//   const { clienteId } = req.params

  try {
    const itens = await prisma.itemTransacao.findMany({
      where: {
        status: "FINALIZADO",
        // clienteId,
      },
      include: {
        produto: true,
      },
    })
    res.json(itens)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar itens finalizados." })
  }
})

router.post("/finalizar/:clienteId/pedido", async (req, res) => {
  const { clienteId } = req.params;

  try {
    // Buscar todos os itens no carrinho do cliente
    const itensCarrinho = await prisma.itemTransacao.findMany({
      where: {
        clienteId,
        status: "CARRINHO",
      },
    });

    if (itensCarrinho.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio." });
    }

    // Calcular total
    const total = itensCarrinho.reduce((acc, item) => {
      return acc + Number(item.preco_unitario) * item.quantidade;
    }, 0);

    // Criar novo pedido
    const pedido = await prisma.pedido.create({
      data: {
        clienteId,
        date: new Date(),
        status: "PENDENTE",
        total,
      },
    });

    // Atualizar todos os itens do carrinho para status: PEDIDO e conectar ao novo pedido
    const updates = itensCarrinho.map((item) =>
      prisma.itemTransacao.update({
        where: { id: item.id },
        data: {
          status: "PEDIDO",
          pedido: {
            connect: { id: pedido.id },
          },
        },
      })
    );

    await Promise.all(updates);

    res.status(201).json({ message: "Pedido finalizado com sucesso!", pedidoId: pedido.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao finalizar pedido." });
  }
});

export default router;
