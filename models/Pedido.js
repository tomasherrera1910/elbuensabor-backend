const mongoose = require('mongoose')
const { model, Schema } = mongoose

const pedidoSchema = new Schema({
  fecha: String,
  estado: String,
  horaEstimadaLlegada: String,
  minutosEstimados: Number,
  tipoEnvio: String,
	    metodoPago: String,
  total: Number,
  mensaje: String,
	    detallesPedidos: [{
    type: Schema.Types.ObjectId,
    ref: 'DetallePedido'
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
	    domicilio: {
    type: Schema.Types.ObjectId,
    ref: 'Address'
  },
  factura: {
    type: Schema.Types.ObjectId,
    ref: 'Factura'
  },
  estadoMercadoPago: String
})
pedidoSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})
const Pedido = model('Pedido', pedidoSchema)

module.exports = Pedido
