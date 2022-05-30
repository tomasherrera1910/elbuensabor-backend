const pedidosRouter = require('express').Router()
const Pedido = require('../models/Pedido')
const User = require('../models/User')
const userExtractor  = require('../middlewares/userExtractor')

pedidosRouter.get('/', (req, res, next) => {
    Pedido.find({})
    .then(pedidos => res.json(pedidos))
    .catch(error => next(error))
})

pedidosRouter.get('/:id' , (req, res, next) => {
    const {id} = req.params
    Pedido.findById(id)
    .then(pedido => {
          pedido ? res.json(pedido)
                 : res.status(404).end()
    })
    .catch(error => next(error))
})
//TESTEAR PEDIDOS Y ARREGLAR HORA ESTIMADA
pedidosRouter.post('/', userExtractor, async(req, res, next) => {
    const {userId, body} = req
    const user = await User.findById(userId)
    if(!user){
        return res.status(401).json({error:'¡Tenés que loguearte antes de hacer un pedido!'})
    }
    const {tipoEnvio} = body
    if(!tipoEnvio){
        return res.status(400).json({error:'¡Ingrese si es un envío a domicilio, o retira en el local!'})
    }
    const newPedido = new Pedido({
        fecha: new Date(),
        estado: 'En revisión...',
        horaEstimadaLlegada: fecha,
        tipoEnvio,
        detallePedidos: [],
        total: detallePedidos.map(detalle => total+=detalle.subtotal),
        user: userId
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