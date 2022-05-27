const artManuDetalleRouter = require('express').Router()
const ArticuloManufacturadoDetalle = require('../models/ArticuloManufacturadoDetalle')
const ArticuloInsumo = require('../models/ArticuloInsumo')
const ArticuloManufacturado = require('../models/ArticuloManufacturado')
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')

artManuDetalleRouter.get('/', (req, res, next) => {
    ArticuloManufacturadoDetalle.find({})
    .then(detalles => res.json(detalles))
    .catch(error => next(error))
})

artManuDetalleRouter.get('/:id', (req, res, next) => {
    const {id} = req.params
    ArticuloManufacturadoDetalle.findById(id)
    .then(detalle =>  {
        detalle ? res.json(detalle)
                 : res.status(404).end()
    })
    .catch(error => next(error))
})

artManuDetalleRouter.post('/:id', userExtractor, async(req, res, next) => {
    const {userId, body, params} = req
    const user = await User.findById(userId)
    if(!user || user.rol !== 'admin'){
        return res.status(401).json({error:'¡Solo los usuarios con permisos pueden realizar esta acción!'})
    }
    const {id} = params
    const articuloManufacturado = await ArticuloManufacturado.findById(id)
    if(!articuloManufacturado){
        return res.status(401).json({error:'¡No se encontró el artículo manufacturado!'})
    }
    const {cantidad, articuloInsumo} = body
    if(!cantidad || !articuloInsumo){
        return res.status(400).json({error:'¡Debe ingresar la cantidad y el producto a usar!'})
    }
    const ingrediente = await ArticuloInsumo.findById(articuloInsumo)
    if(!ingrediente || ingrediente.esInsumo){
        return res.status(400).json({error:'¡No se encontró el artículo, o se selecciono un artículo insumo!'})
    }
    const newArtManuDetalle = new ArticuloManufacturadoDetalle({
        cantidad,
        unidadMedida: ingrediente.unidadMedida,
        articuloInsumo: ingrediente._id
    })
    try {
        const savedArticuloManuDetalle = await newArtManuDetalle.save()
        articuloManufacturado.ingredientes = articuloManufacturado.ingredientes.concat(savedArticuloManuDetalle._id)
        await articuloManufacturado.save()
        res.status(201).json(savedArticuloManuDetalle)
    } catch (error) {
        next(error)
    }
})

artManuDetalleRouter.put('/:id', userExtractor, async(req, res, next) => {
    const {body, userId} = req
    const user = await User.findById(userId)
    if(!user || user.rol !== 'admin'){
        return res.status(401).json({error:'¡Solo los usuarios con permisos pueden realizar esta acción!'})
    }
    const {cantidad} = body
    const {id} = req.params
    const updatedArticuloManufacturadoDetalle = {
        cantidad
    }
    ArticuloManufacturadoDetalle.findByIdAndUpdate(id, updatedArticuloManufacturadoDetalle, {new: true})
    .then(articulo => res.status(202).json(articulo))
    .catch(error => next(error))
})

artManuDetalleRouter.delete('/:id', userExtractor, async(req, res, next) => {
    const {userId, params} = req
    const user = await User.findById(userId)
    if(!user || user.rol !== 'admin'){
        return res.status(401).json({error:'¡Solo los usuarios con permisos pueden realizar esta acción!'})
    }
    const {id} = params
    ArticuloManufacturadoDetalle.findByIdAndDelete(id)
    .then(() => res.status(204))
    .catch(error => next(error))
})

module.exports = artManuDetalleRouter