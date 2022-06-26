const pedidosDetallesRouter = require('express').Router()
const DetallePedido = require('../models/DetallePedido')
const ArticuloInsumo = require('../models/ArticuloInsumo')
const ArticuloManufacturado = require('../models/ArticuloManufacturado')
const ArticuloManufacturadoDetalle = require('../models/ArticuloManufacturadoDetalle')
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

pedidosDetallesRouter.post('/' , userExtractor, async(req, res, next) => {
    const {userId, body} = req
    const user = await User.findById(userId)
    if(!user){
        return res.status(401).json({error:'¡Tenés que loguearte antes de hacer un pedido!'})
    }
    const {cantidad, articuloId, subtotal, articulo, tipoDeArticulo} = body
    //VALIDAR STOCK DEL ARTICULO en caso de bebida
    if(tipoDeArticulo === 'insumo'){
        const bebida = await ArticuloInsumo.findById(articuloId)
        if(bebida.stockActual < 1)
        return res.status(400).json({error:'¡Lo sentimos, no tenemos stock del producto indicado!'})
    }
    //VALIDAR STOCK DEL ARTICULO en caso de comida
    if(tipoDeArticulo === 'manufacturado'){
        const {ingredientes} = await ArticuloManufacturado.findById(articuloId)
        for (const ingrediente of ingredientes) {
            //console.log('ingrediente:' + ingrediente)
            const ingredienteDB = await ArticuloManufacturadoDetalle.findById(ingrediente) 
            //console.log(ingredienteDB)  
            const ingredienteInsumo = await ArticuloInsumo.findById(ingredienteDB.articuloInsumo)
            if(ingredienteDB.cantidad > ingredienteInsumo.stockActual)
            return res.status(400).json({error:'¡Lo sentimos, no tenemos suficiente stock de alguno de los ingredientes del producto seleccionado!'})
        }
    }
    if(!articuloId || !subtotal || !articulo){
        return res.status(400).json({error:'¡Debe seleccionar algun articulo para comprar!'})
    }
    
    const newDetallePedido = new DetallePedido({
        cantidad: cantidad || 1,
        subtotal,
        articulo,
        tipoDeArticulo,
        articuloId
    })
    try {
        const savedDetallePedido = await newDetallePedido.save()
        return res.status(201).json(savedDetallePedido)
    } catch (error) {
        next(error)
    }
})

pedidosDetallesRouter.put('/:id' , userExtractor, async(req,res, next) => {
    const {userId, body, params} = req
    const user = await User.findById(userId)
    if(!user){
        return res.status(401).json({error:'¡Tenés que loguearte antes de hacer un pedido!'})
    }
    const {id} = params
    const {cantidad} = body
    const detallePedidoSeleccionado = await DetallePedido.findById(id)
    const {tipoDeArticulo, articuloId} = detallePedidoSeleccionado
    //VALIDAR STOCK DEL ARTICULO en caso de bebida
    if(tipoDeArticulo === 'insumo'){
        const bebida = await ArticuloInsumo.findById(articuloId)
        if(bebida.stockActual < cantidad)
           return res.status(400).json({error:`¡Lo sentimos, solo quedan ${(cantidad-1)} unidades!`})
    }
    //VALIDAR STOCK DEL ARTICULO en caso de comida
    if(tipoDeArticulo === 'manufacturado'){
        const comida = await ArticuloManufacturado.findById(articuloId)
        for (const ingrediente of comida.ingredientes) {
            const ingredienteDB = await ArticuloManufacturadoDetalle.findById(ingrediente) 
            const ingredienteInsumo = await ArticuloInsumo.findById(ingredienteDB.articuloInsumo)
            if((ingredienteDB.cantidad * cantidad) > ingredienteInsumo.stockActual)
            return res.status(400).json({error:`¡Lo sentimos, el stock de ingredientes alcanza para ${(cantidad-1)} unidades!`})
        }
    }
    const updatedDetallePedido ={
        cantidad,
	}
    DetallePedido.findByIdAndUpdate(id, updatedDetallePedido, {new: true})
    .then(detalle => res.status(202).json(detalle))
    .catch(error => next(error))
})
pedidosDetallesRouter.delete('/:id', (req, res, next) => {
    const {id} = req.params
    DetallePedido.findByIdAndDelete(id)
    .then(() => res.send('Articulo eliminado del carrito!'))
    .catch(error => next(error))
})

module.exports = pedidosDetallesRouter