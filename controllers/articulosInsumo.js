const articulosInsumoRouter = require('express').Router()
const ArticuloInsumo = require('../models/ArticuloInsumo')
const userExtractor= require('../middlewares/userExtractor')
const User = require('../models/User')

articulosInsumoRouter.get('/', (req, res, next) => {
    ArticuloInsumo.find({})
    .then(articulos => res.json(articulos))
    .catch(error => next(error))
})

articulosInsumoRouter.get('/:id', (req, res, next) => {
    const {id} = req.body
    ArticuloInsumo.findById(id)
    .then(articulo => {
        articulo ? res.json(articulo)
             : res.status(404).end()
    })
    .catch(error => next(error))
})

articulosInsumoRouter.post('/', userExtractor, async(req, res, next) => {
    const {userId, body} = req
    const user = await User.findById(userId)
    if(!user || user.rol !== 'admin'){
        return res.status(401).json({error:'¡Solo los usuarios con permisos pueden realizar esta acción!'})
    }
    const {rubro, denominacion, precioCompra, precioVenta, stockActual, stockMinimo, unidadMedida, esInsumo} = body
    if(!rubro || !denominacion || !precioCompra || !stockActual || !unidadMedida){
        return res.status(400).json({error:'Debe llenar los campos rubro, denominacion, precio compra, stock y unidad de medida para crear el articulo'})
    }
    const newArticuloInsumo = new ArticuloInsumo({
        rubro,
        denominacion,
        precioCompra,
        precioVenta: precioVenta || 0,
        stockActual,
        stockMinimo: stockMinimo || 0,
        unidadMedida,
        esInsumo: esInsumo || false,
        baja: false 
    })
    try {
        const savedArticuloInsumo = await newArticuloInsumo.save()
        res.status(201).json(savedArticuloInsumo)
    } catch (error) {
        next(error)
    }
})

articulosInsumoRouter.put('/:id', userExtractor, async(req, res, next) => {
    const {body, userId} = req
    const user = await User.findById(userId)
    if(!user || user.rol !== 'admin'){
        return res.status(401).json({error:'¡Solo los usuarios con permisos pueden realizar esta acción!'})
    }
    const {rubro, denominacion, precioCompra, precioVenta, stockActual, stockMinimo, unidadMedida, esInsumo} = body
    const {id} = req.params
    const updatedArticuloInsumo = {
        rubro,
        denominacion,
        precioCompra,
        precioVenta,
        stockActual,
        stockMinimo,
        unidadMedida,
        esInsumo,
        baja
    }
    ArticuloInsumo.findByIdAndUpdate(id, updatedArticuloInsumo, {new: true})
    .then(articulo => res.status(202).json(articulo))
    .catch(error => next(error))
})

articulosInsumoRouter.delete('/:id', userExtractor, async(req, res, next) => {
    const {userId, params} = req
    const user = await User.findById(userId)
    if(!user || user.rol !== 'admin'){
        return res.status(401).json({error:'¡Solo los usuarios con permisos pueden realizar esta acción!'})
    }
    const {id} = params
    ArticuloInsumo.findByIdAndUpdate(id, {baja:true}, {new: true})
    .then(() => res.status(204))
    .catch(error => next(error))
})

module.exports = articulosInsumoRouter