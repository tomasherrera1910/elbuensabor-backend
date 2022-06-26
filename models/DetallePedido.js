const mongoose = require('mongoose')
const {Schema, model} = mongoose

const detallePedidoSchema = new Schema({
    cantidad: Number,
    subtotal: Number,
    articulo: String,
    tipoDeArticulo: String,
    articuloId: {
        type: Schema.Types.ObjectId,
        required: true,
        // Instead of a hardcoded model name in `ref`, `refPath` means Mongoose
        // will look at the `onModel` property to find the right model.
        refPath: 'onArticle'
      },
      onArticle: {
        type: String,
        enum: ['ArticuloManufacturado', 'ArticuloInsumo']
      },
     pedido: {
      type: Schema.Types.ObjectId,
      ref: 'Pedido'
     } 
})
detallePedidoSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const DetallePedido = model('DetallePedido', detallePedidoSchema)

module.exports = DetallePedido