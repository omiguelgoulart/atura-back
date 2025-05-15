import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

const prisma = new PrismaClient();
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

const router = Router();

const pedidoSchema = z.object({
  date: z.string().optional(),
  status: z.enum([
    "PENDENTE",
    "PROCESSANDO",
    "ENVIADO",
    "ENTREGUE",
    "CANCELADO",
  ]),
  total: z.number().positive(),
  clienteId: z.string().uuid(),
  enderecoId: z.number(),
  itemPedido: z.array(
    z.object({
      produtoId: z.number(),
      quantidade: z.number().positive(),
      preco_unitario: z.number().positive(),
    })
  ),
});

router.get("/", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        endereco: true,
        itemPedido: {
          include: { produto: true },
        },
      },
    });
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

router.post("/", async (req, res) => {
    const valida = pedidoSchema.safeParse(req.body)
    if (!valida.success) {
      res.status(400).json({ erro: valida.error })
      return
    }

  const { date, status, total, clienteId, enderecoId, itemPedido } =
    valida.data;

  try {
    const data = {
      date: date ? new Date(Date.parse(date)) : new Date(),
      status,
      total,
      cliente: { connect: { id: clienteId } },
      endereco: { connect: { id: enderecoId } },
      itemPedido: {
        create: itemPedido.map((item) => ({
          produto: { connect: { id: item.produtoId } },
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        })),
      },
    }
if (date) {
  data.date = new Date(Date.parse(date));
}


    const pedido = await prisma.pedido.create({ data });
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pedido = await prisma.pedido.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(200).json(pedido);
  } catch (error) {
    res.status(400).json({ erro: error });
  }
});

router.patch("/:id", async (req, res) => {
  const valida = pedidoSchema.safeParse(req.body);
  if (!valida.success) {
    return res.status(400).json({ erro: valida.error.format() });
  }

  const { date, status, total, clienteId, enderecoId, itemPedido } =
    valida.data;

  try {
    // remover os itens anteriores (opcional, dependendo da sua lógica)
    await prisma.itemPedido.deleteMany({
      where: { pedidoId: Number(req.params.id) },
    });

    const data: any = {
      status,
      total,
      cliente: { connect: { id: clienteId } },
      endereco: { connect: { id: enderecoId } },
      itemPedido: {
        create: itemPedido.map((item) => ({
          produto: { connect: { id: item.produtoId } },
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        })),
      },
    };

if (date) {
  data.date = new Date(Date.parse(date));
}


    const pedido = await prisma.pedido.update({
      where: { id: Number(req.params.id) },
      data,
    });

    res.status(200).json(pedido);
  } catch (error) {
    res.status(400).json({ erro: error });
  }
});

export default router;
