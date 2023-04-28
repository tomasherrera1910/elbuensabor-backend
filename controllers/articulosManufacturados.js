const articulosManufacturadosRouter = require('express').Router()
const ArticuloManufacturado = require('../models/ArticuloManufacturado')
// const ArticuloManufacturadoDetalle = require('../models/ArticuloManufacturadoDetalle')
const User = require('../models/User')
const userExtractor = require('../middlewares/userExtractor')
const fileUpload = require('express-fileupload')
const { uploadImage, deleteImage } = require('../utils/cloudinary')
const fs = require('fs/promises')

articulosManufacturadosRouter.get('/', (req, res, next) => {
  ArticuloManufacturado.find({}).populate('ingredientes')
    .then(articulos => res.json(articulos))
    .catch(error => next(error))
})

articulosManufacturadosRouter.get('/:id', (req, res, next) => {
  const { id } = req.params
  ArticuloManufacturado.findById(id).populate('ingredientes')
    .then(articulo => {
      articulo
        ? res.json(articulo)
        : res.status(404).end()
    })
    .catch(error => next(error))
})

articulosManufacturadosRouter.post('/', fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads'
}), userExtractor, async (req, res, next) => {
  const { userId, body } = req
  const user = await User.findById(userId)
  if (!user || user.rol !== 'admin') {
    return res.status(401).json({ error: '¡Solo los usuarios con permisos pueden realizar esta acción!' })
  }
  const { rubro, tiempoEstimadoCocina, denominacion, precioVenta } = body
  const imagen = req.files?.imagen
  if (!rubro || !tiempoEstimadoCocina || !denominacion || !precioVenta || !imagen) {
    return res.status(400).json({ error: '¡Todos los campos son obligatorios!' })
  }
  const cloudinaryObject = await uploadImage(imagen.tempFilePath)
  // seteamos en la data los datos de la imagen creada en cloudinary
  const finalImage = { public_id: cloudinaryObject.public_id, url: cloudinaryObject.secure_url }
  // despues de subirla a cloudinary borramos el archivo de la carpeta uploads
  await fs.unlink(imagen.tempFilePath)

  const newArticuloManufacturado = new ArticuloManufacturado({
    rubro,
    tiempoEstimadoCocina,
    denominacion,
    precioVenta,
    imagen: finalImage,
    baja: false,
    ingredientes: []
  })
  try {
    const savedArticuloManufacturado = await newArticuloManufacturado.save()
    res.status(201).json(savedArticuloManufacturado)
  } catch (error) {
    next(error)
  }
})
articulosManufacturadosRouter.put('/:id', fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads'
}), userExtractor, async (req, res, next) => {
  const { userId, body } = req
  const user = await User.findById(userId)
  if (!user || user.rol !== 'admin') {
    return res.status(401).json({ error: '¡Solo los usuarios con permisos pueden realizar esta acción!' })
  }
  const { rubro, tiempoEstimadoCocina, denominacion, precioVenta } = body
  const imagen = req.files?.imagen
  const { id } = req.params
  const articuloEditar = await ArticuloManufacturado.findById(id)
  let finalImage
  if (imagen) {
    const cloudinaryObject = await uploadImage(imagen.tempFilePath)
    finalImage = { public_id: cloudinaryObject.public_id, url: cloudinaryObject.secure_url }
    await fs.unlink(imagen.tempFilePath)
  }
  if (finalImage) {
    await deleteImage(articuloEditar.imagen.public_id)
  }
  const updatedArticuloManufacturado = {
    rubro,
    tiempoEstimadoCocina,
    denominacion,
    precioVenta,
    imagen: finalImage || articuloEditar.imagen
  }
  ArticuloManufacturado.findByIdAndUpdate(id, updatedArticuloManufacturado, { new: true })
    .then(articulo => res.status(202).json(articulo))
    .catch(error => next(error))
})

articulosManufacturadosRouter.delete('/:id', userExtractor, async (req, res, next) => {
  const { userId, params } = req
  const user = await User.findById(userId)
  if (!user || user.rol !== 'admin') {
    return res.status(401).json({ error: '¡Solo los usuarios con permisos pueden realizar esta acción!' })
  }
  const { id } = params
  ArticuloManufacturado.findByIdAndUpdate(id, { baja: true }, { new: true })
    .then(articulo => res.status(204).json(articulo))
    .catch(error => next(error))
})

module.exports = articulosManufacturadosRouter
