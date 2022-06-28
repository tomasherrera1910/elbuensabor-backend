require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())

require('./db/connect')
const loginRouter = require('./controllers/login')
const userRouter = require('./controllers/users')
const addressRouter = require('./controllers/addresses')
const articulosInsumoRouter = require('./controllers/articulosInsumo')
const artManuDetalleRouter = require('./controllers/articulosManufacturadosDetalle')
const articulosManufacturadosRouter = require('./controllers/articulosManufacturados')
const pedidosDetallesRouter = require('./controllers/pedidosDetalles')
const pedidosRouter = require('./controllers/pedidos')
const handleErrors = require('./middlewares/handleErrors')
const notFound = require('./middlewares/notFound')

app.use('/login', loginRouter)
app.use('/users', userRouter)
app.use('/addresses', addressRouter)
app.use('/articulosInsumo', articulosInsumoRouter)
app.use('/articulosManuDetalle', artManuDetalleRouter)
app.use('/articulosManufacturados', articulosManufacturadosRouter)
app.use('/pedidosDetalle', pedidosDetallesRouter)
app.use('/pedidos', pedidosRouter)

app.use(notFound)
app.use(handleErrors)
app.listen(process.env.PORT,() => {
    console.log(`server on in port ${process.env.PORT}`)
}) 

