const articulosManufacturadosRouter = require('express').Router()
const ArticuloManufacturado = require('../models/ArticuloManufacturado')
const ArticuloManufacturadoDetalle = require('../models/ArticuloManufacturadoDetalle')
const ArticuloInsumo = require('../models/ArticuloInsumo')
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')

articulosManufacturadosRouter.get('/', (req, res, next) => {
    ArticuloManufacturado.find({})
    .then(articulos => res.json(articulos))
    .catch(error => next(error))
})

articulosManufacturadosRouter.get('/:id', (req, res, next) => {
    const {id} = req.params
    ArticuloManufacturado.findById(id)
    .then(articulo =>  {
        articulo ? res.json(articulo)
                 : res.status(404).end()
    })
    .catch(error => next(error))
})

articulosManufacturadosRouter.post('/', userExtractor, async(req, res, next) => {
    const {userId, body} = req
    const user = await User.findById(userId)
    if(!user || user.rol !== 'admin'){
        return res.status(401).json({error:'¡Solo los usuarios con permisos pueden realizar esta acción!'})
    }
    
})