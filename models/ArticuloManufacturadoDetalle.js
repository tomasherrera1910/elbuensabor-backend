const mongoose = require('mongoose')
const {model, Schema} = mongoose

const articuloManufacturadoDetalleSchema = new Schema({
    cantidad: Number,
    unidadMedida: String,
    articuloInsumo: {
        type: Schema.Types.ObjectId,
        ref: 'ArticuloInsumo'
    }
})

articuloManufacturadoDetalleSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const ArticuloManufacturadoDetalle = model('ArticuloManufacturadoDetalle', articuloManufacturadoDetalleSchema)

module.exports = ArticuloManufacturadoDetalle