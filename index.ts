import express from 'express'
import fileUpload from 'express-fileupload'
import routesProdutos from './routes/produtos'
import routesMarcas from './routes/marcas'
import routesResposta from './routes/respostaAvaliacao'
import routesAdmin from './routes/admin'
import routesPedidos from './routes/pedidos'
import routesAvaliacoes from './routes/avaliacoes'
import routesCarrinho from './routes/carrinho'
import routesItemPedido from './routes/itensPedido'
import routesEnderecos from './routes/endereco'
import routesClientes from './routes/clientes'
import routesLogin from './routes/login'
import cors from 'cors'

const app = express()
const port = 3001

app.use(express.json())
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }))
app.use(cors())

app.use('/avaliacoes', routesAvaliacoes)
app.use('/carrinho', routesCarrinho)
app.use('/clientes', routesClientes)
app.use('/enderecos', routesEnderecos)
app.use('/itemPedido', routesItemPedido)
app.use('/login', routesLogin)
app.use('/marcas', routesMarcas)
app.use('/pedidos', routesPedidos)
app.use('/produtos', routesProdutos)
app.use('/respostas', routesResposta)
app.use('/admin', routesAdmin)


app.get('/', (req, res) => {
  res.send('API: Perfumaria')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})

export default app