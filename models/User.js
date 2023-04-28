const mongoose = require('mongoose')
const { Schema, model } = mongoose

const userSchema = new Schema({
  nombre: String,
  apellido: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  clave: String,
  rol: String,
  telefono: Number,
  addresses: [{
    type: Schema.Types.ObjectId,
    ref: 'Address'
  }],
  pedidos: [{
    type: Schema.Types.ObjectId,
    ref: 'Pedido'
  }]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.clave
  }
})

const User = model('User', userSchema)

module.exports = User
