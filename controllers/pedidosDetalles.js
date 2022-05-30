const pedidosDetallesRouter = require('express').Router()
const DetallePedido = require('../models/DetallePedido')
const Pedido = require('../models/Pedido')
const ArticuloInsumo = require('../models/ArticuloInsumo')
const ArticuloManufacturado = require('../models/ArticuloManufacturado')
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')

pedidosDetallesRouter.get('/articulos', async(req, res, next) => {
    try{    
    const articulosInsumo = await ArticuloInsumo.find({esInsumo:true})
    const articulosManufacturados = await ArticuloManufacturado.find({})
    const articulosVenta = {
        articulosInsumo,
        articulosManufacturados
    }
    res.json(articulosVenta)

    }catch(error){
        next(error)
    }
})

pedidosDetallesRouter.get('/', (req, res, next) => {
    DetallePedido.find({})
    .then(detalles => res.json(detalles))
    .catch(error => next(error))
})

pedidosDetallesRouter.get('/:id', (req, res, next) => {
    const {id} = req.params
    DetallePedido.findById(id)
    .then(detalle =>  {
            detalle ? res.json(detalle)
                    : res.status(404).end()})
    .catch(error => next(error))
})

pedidosDetallesRouter.post('/:id' , userExtractor, async(req, res, next) => {
    const {userId, body, params} = req
    const user = await User.findById(userId)
    if(!user){
        return res.status(401).json({error:'¡Tenés que loguearte antes de hacer un pedido!'})
    }
    const {id} = params
    const pedido = await Pedido.findById(id)
    if(!pedido){
        return res.status(401).json({error:'¡No se encontró el pedido asociado!'})
    }
    const {cantidad, articuloId} = body
    if(!cantidad || !articuloId){
        return res.status(400).json({error:'¡Debe ingresar la cantidad y el articulo para comprar!'})
    }
    
    const newDetallePedido = new DetallePedido({
        cantidad,
        articuloId,

    })
    try {
        const savedDetallePedido = await newDetallePedido.save()
        pedido.detallesPedidos = pedido.detallesPedidos.concat(savedDetallePedido._id)
        await pedido.save()
        res.status(201).json(savedDetallePedido)
    } catch (error) {
        next(error)
    }
})
pedidosDetallesRouter.delete('/:id', (req, res, next) => {
    const {id} = req.params
    DetallePedido.findByIdAndDelete(id)
    .then(() => res.send('Articulo eliminado del carrito!'))
    .catch(error => next(error))
})

module.exports = pedidosDetallesRouter