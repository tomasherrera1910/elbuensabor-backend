const pedidosRouter = require('express').Router()
const Pedido = require('../models/Pedido')
const DetallePedido = require('../models/DetallePedido')
const ArticuloManufacturado = require('../models/ArticuloManufacturado')
const ArticuloManufacturadoDetalle = require('../models/ArticuloManufacturadoDetalle')
const ArticuloInsumo = require('../models/ArticuloInsumo')
const User = require('../models/User')
const userExtractor  = require('../middlewares/userExtractor')

pedidosRouter.get('/', async(req, res, next) => {
    Pedido.find({})
    .then(pedidos => res.json(pedidos))
    .catch(error => next(error))
})

pedidosRouter.get('/:id' , async(req, res, next) => {
    const {id} = req.params
    const user = await User.findById(id)
    if(!user){
        return res.status(401).json({error:'¡Inicia sesión para ver tus pedidos!'})
    }
    Pedido.find({user : user.id})
          .populate(['detallesPedidos', 
        {
                path: 'user',
                select: {'nombre':1, 'apellido':1, 'telefono':1},
        }])
        .then(pedidos => res.json(pedidos))
        .catch(error => next(error))
})

pedidosRouter.post('/', userExtractor, async(req, res, next) => {
    const {userId, body} = req
    const user = await User.findById(userId)
    if(!user){
        return res.status(401).json({error:'¡Tenés que loguearte antes de hacer un pedido!'})
    }
    const {metodoPago, articulos, usuario, total, domicilio} = body
    if(!metodoPago || !articulos || !usuario || !total){
        return res.status(400).json({error:'¡Faltan datos necesarios para el pedido!'})
    }
    if(metodoPago.envio === 'Envío a domicilio' && !domicilio){
        return res.status(400).json({error:'¡Si el envío es a domicilio especifique una direccion!'})
    }
    //DISMINUIR EL STOCK y CALCULAR TIEMPO ESTIMADO
    let tiempoEstimado = 0
    for (const detalle of articulos) {
        const articulo = await DetallePedido.findById(detalle)
        if(articulo.tipoDeArticulo === 'insumo'){
            const bebida = await ArticuloInsumo.findById(articulo.articuloId)
            if(bebida.stockActual){
            bebida.stockActual = (bebida.stockActual - articulo.cantidad) 
            await bebida.save()
            }
        }
        else if(articulo.tipoDeArticulo === 'manufacturado'){
            const comida = await ArticuloManufacturado.findById(articulo.articuloId)
            tiempoEstimado += comida.tiempoEstimadoCocina
            for (const ingrediente of comida.ingredientes) {
                const ingredienteDB = await ArticuloManufacturadoDetalle.findById(ingrediente) 
                const ingredienteInsumo = await ArticuloInsumo.findById(ingredienteDB.articuloInsumo)
                ingredienteInsumo.stockActual = (ingredienteInsumo.stockActual - (ingredienteDB.cantidad * articulo.cantidad))
                await ingredienteInsumo.save()
            }
        }
    }
    //CALCULAR TIEMPO ESTIMADO CON PEDIDOS ACUMULADOS EN LA COCINA
    const articulosEnCocina = await Pedido.find({estado:'En cocina...'})
    let tiempoEstimadoAcumuladoEnCocina = 0
    if(articulosEnCocina.length > 0){
        for (const pedidoEnCocina of articulosEnCocina) {
            tiempoEstimadoAcumuladoEnCocina += pedidoEnCocina.tiempoEstimadoDeEspera
        }   
        tiempoEstimado = tiempoEstimado + (tiempoEstimadoAcumuladoEnCocina / 4) //TENEMOS EN CUENTA QUE SIEMPRE HAY UN MÍNIMO DE 4 COCINEROS
    }
    if(metodoPago.envio === 'Envío a domicilio') tiempoEstimado += 10
    //10% DE DESCUENTO SI RETIRA EN EL LOCAL
    let totalConDescuento = null
    if(metodoPago.envio === 'Retiro en el local') totalConDescuento = (total - ((total * 10) / 100))

    const fecha = new Date()
    
    const newPedido = new Pedido({
        fecha: fecha.toLocaleString(),
        estado: 'En revisión...',
        tiempoEstimadoDeEspera: tiempoEstimado,
        tipoEnvio: metodoPago.envio,
        metodoPago: metodoPago.metodoDePago,
        detallesPedidos: articulos,
        total: totalConDescuento ?? total,
        user: usuario,
        domicilio: domicilio || null
    })
    try {
        const savedPedido = await newPedido.save()
        user.pedidos = user.pedidos.concat(savedPedido._id)
        await user.save()
        res.status(201).json(savedPedido)
    } catch (error) {
        next(error)
    }
})

module.exports = pedidosRouter