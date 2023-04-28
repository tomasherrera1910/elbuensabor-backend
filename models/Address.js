const mongoose = require('mongoose')
const { Schema, model } = mongoose

const addressSchema = new Schema({
  calle: String,
  numero: Number,
  localidad: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})
addressSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Address = model('Address', addressSchema)

module.exports = Address
