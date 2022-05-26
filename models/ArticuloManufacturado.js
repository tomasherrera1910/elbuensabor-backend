const mongoose = require('mongoose')
const {model, Schema} = mongoose

const articuloManufacturadoSchema= new Schema({
    rubro: String,
    tiempoEstimadoCocina: Number,
    denominacion: String,
    precioVenta: Number,
    imagen: String,
    articulosInsumos: [{
        type: Schema.Types.ObjectId,
        ref: 'ArticuloManufacturadoDetalle'
    }]
})

articuloManufacturadoSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const ArticuloManufacturado = model('ArticuloManufacturado', articuloManufacturadoSchema)

module.exports = ArticuloManufacturado