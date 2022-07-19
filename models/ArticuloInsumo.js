const mongoose = require('mongoose')
const {model, Schema} = mongoose

const articuloInsumoSchema = new Schema({
    rubro: String,
    denominacion: String,
    precioCompra: Number,
    fecha: String,
    precioVenta: Number,
    stockActual: Number,
    stockMinimo: Number,
    unidadMedida: String,
    esInsumo: Boolean,
    baja: Boolean
})

articuloInsumoSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const ArticuloInsumo = model('ArticuloInsumo', articuloInsumoSchema)

module.exports = ArticuloInsumo