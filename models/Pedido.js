const mongoose = require('mongoose')
const {model, Schema} = mongoose

const pedidoSchema = new Schema({
        fecha: Date,
        estado: String,
        horaEstimadaLlegada: Date,
        tipoEnvio: String,
        total:Number,
        detallesPedidos: [{
            type: Schema.Types.ObjectId,
            ref: 'DetallePedido'
        }],
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
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