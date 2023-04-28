const mongoose = require('mongoose')
const { Schema, model } = mongoose

const facturaSchema = new Schema({
  fecha: String,
  numero: Number,
  montoDescuento: Number,
  formaPago: String,
  pedido: {
    type: Schema.Types.ObjectId,
    ref: 'Pedido'
  }
})
facturaSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})
const Factura = model('Factura', facturaSchema)

module.exports = Factura
