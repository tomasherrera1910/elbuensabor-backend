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
//GET PEDIDOS (pendientes para interfaz de Cajero y que vea que esta todo correcto antes de enviarlo a la cocina)
pedidosRouter.get('/pendientes', userExtractor, async(req, res, next) => {
    const {userId} = req
    const user = await User.findById(userId)
    if(!user && (user.rol !== 'cajero' || user.rol !== 'admin')){
        return res.status(401).json({error:'¡El usuario no tiene autorización para realizar esta operación!'})
    }
    Pedido.find({estado:'En revisión...'})
          .populate(['detallesPedidos', 
        {
                path: 'user',
                select: {'nombre':1, 'apellido':1, 'telefono':1},
        },
	    {
                path: 'domicilio',
                select: {'calle':1, 'numero':1},
        },
	])
        .then(pedidos => res.json(pedidos))
        .catch(error => next(error))
})
//GET PEDIDOS (finalizado son los pedidos que ya cocinados que el cajero deberá entregar al cliente o al delivery)
pedidosRouter.get('/finalizados', userExtractor, async(req, res, next) => {
    const {userId} = req
    const user = await User.findById(userId)
    if(!user && (user.rol !== 'cajero' || user.rol !== 'admin')){
        return res.status(401).json({error:'¡El usuario no tiene autorización para realizar esta operación!'})
    }
    Pedido.find({$or:[{ estado: 'En camino...' }, { estado: 'Finalizado' }]})
          .populate(['detallesPedidos', 
        {
                path: 'user',
                select: {'nombre':1, 'apellido':1, 'telefono':1},
        },
	    {
                path: 'domicilio',
                select: {'calle':1, 'numero':1},
        },
	])
          .then(pedidos => res.json(pedidos))
          .catch(error => next(error))
})

//GET PEDIDOS (enCocina son los pedidos que se muestran en la interfaz de los cocineros)
pedidosRouter.get('/enCocina', userExtractor, async(req, res, next) => {
    const {userId} = req
    const user = await User.findById(userId)
    if(!user && (user.rol !== 'cocinero' || user.rol !== 'admin')){
        return res.status(401).json({error:'¡El usuario no tiene autorización para realizar esta operación!'})
    }
    Pedido.find({estado:'En cocina...'})
          .populate(['detallesPedidos'])
          .then(pedidos => res.json(pedidos))
          .catch(error => next(error))
})

//GET PEDIDOS PARA MOSTRARLE AL CAJERO CUANTO STOCK QUEDA ANTES DE PROCESAR UN PEDIDO
pedidosRouter.get('/stockPedido/:id', async(req, res) => {
    const {id} = req.params
    let articulosYstock = []
    const pedido = await Pedido.findById(id)
    for(const detalleId of pedido.detallesPedidos){
        const articulo = await DetallePedido.findById(detalleId)
        if(articulo.tipoDeArticulo === 'insumo'){
            const bebida = await ArticuloInsumo.findById(articulo.articuloId)
            articulosYstock = articulosYstock.concat({stock:bebida.stockActual,medida:bebida.unidadMedida, cantidad:articulo.cantidad, articulo:bebida.denominacion})
        }
        else if(articulo.tipoDeArticulo === 'manufacturado'){
            const comida = await ArticuloManufacturado.findById(articulo.articuloId)
            for (const ingrediente of comida.ingredientes) {
                const ingredienteDB = await ArticuloManufacturadoDetalle.findById(ingrediente) 
                const ingredienteInsumo = await ArticuloInsumo.findById(ingredienteDB.articuloInsumo)
                articulosYstock = articulosYstock.concat({stock:ingredienteInsumo.stockActual, medida:ingredienteInsumo.unidadMedida, cantidad:(ingredienteDB.cantidad * articulo.cantidad), articulo:ingredienteInsumo.denominacion})
            }
        }
    }
    res.json(articulosYstock)   
})

//GET PEDIDOS (de un usuario para interfaz de misPedidos)
pedidosRouter.get('/usuario/:id' , async(req, res, next) => {
    const {id} = req.params
    const user = await User.findById(id)
    if(!user){
        return res.status(401).json({error:'¡Inicia sesión para ver tus pedidos!'})
    }
    Pedido.find({user : user.id})
          .populate(['detallesPedidos', 'factura',
        {
                path: 'user',
                select: {'nombre':1, 'apellido':1, 'telefono':1},
        },
	    {
                path: 'domicilio',
                select: {'calle':1, 'numero':1},
        },
	])
        .then(pedidos => res.json(pedidos))
        .catch(error => next(error))
})

//CREAR PEDIDO (y 10% de descuento si retira en el local)
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
    //10% DE DESCUENTO SI RETIRA EN EL LOCAL
    let totalConDescuento = null
    if(metodoPago.envio === 'Retiro en el local') totalConDescuento = (total - ((total * 10) / 100))

    const fecha = new Date()
    
    const newPedido = new Pedido({
        fecha: fecha.toLocaleString(),
        estado: 'En revisión...',
        horaEstimadaLlegada: 0,
        minutosEstimados: 0,
        tipoEnvio: metodoPago.envio,
        metodoPago: metodoPago.metodoDePago,
        estadoMercadoPago: null,
        detallesPedidos: articulos,
        total: totalConDescuento ?? total,
        user: usuario,
        domicilio: domicilio || null,
        mensaje: null,
        factura: null
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

//EDITAR PEDIDO (ESTADO, STOCK, TIEMPO ESTIMADO)
pedidosRouter.put('/:id', userExtractor, async(req, res,next) => {
    const {userId, params, body} = req
    const user = await User.findById(userId)
    if(!user){
        return res.status(401).json({error:'¡Tenés que loguearte antes de hacer un pedido!'})
    }
    const {id} = params
    const {estado, estadoMercadoPago, mensaje} = body

    const pedido = await Pedido.findById(id)
    //DISMINUIR EL STOCK y CALCULAR TIEMPO ESTIMADO
    let horaEstimada = 0
    let tiempoEstimado = 0
    if(estado === 'En cocina...'){
        for (const detalle of pedido.detallesPedidos) {
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
                tiempoEstimadoAcumuladoEnCocina += pedidoEnCocina.minutosEstimados
            }   
            tiempoEstimado = tiempoEstimado + (tiempoEstimadoAcumuladoEnCocina / 4) //TENEMOS EN CUENTA QUE SIEMPRE HAY UN MÍNIMO DE 4 COCINEROS
        }
        if(pedido.metodoPago.envio === 'Envío a domicilio') tiempoEstimado += 10
        
        const fecha = new Date()
        fecha.setTime(fecha.getTime() + (Math.round(tiempoEstimado)*1000*60));
        horaEstimada = fecha.toLocaleTimeString()
        }
        const updatedPedido = {
            estado: estado || pedido.estado,
            horaEstimadaLlegada: horaEstimada || pedido.tiempoEstimadoDeEspera ,
            minutosEstimados: tiempoEstimado || 0,
            estadoMercadoPago: estadoMercadoPago || pedido.estadoMercadoPago,
            mensaje: mensaje || null
        }
        Pedido.findByIdAndUpdate(id, updatedPedido, {new: true})
        .then(pedido => res.status(202).json(pedido))
        .catch(error => next(error))
})
pedidosRouter.delete('/:id', (req,res,next) => {
    const {id} = req.params
    Pedido.findByIdAndDelete(id)
    .then(() => res.status(204).json({ok:'pedido eliminado con éxito!'}))
    .catch(error => next(error))
})
module.exports = pedidosRouter