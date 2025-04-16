import express from 'express'
import fileUpload from 'express-fileupload'
import routesProdutos from './routes/produtos'
import routesMarcas from './routes/marcas'
import routesFotos from './routes/fotos'
import cors from 'cors'

const app = express()
const port = 3001

app.use(express.json())
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }))
app.use(cors())

app.use('/produtos', routesProdutos)
app.use('/marcas', routesMarcas)
app.use('/fotos', routesFotos)


app.get('/', (req, res) => {
  res.send('API: Perfumaria')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})