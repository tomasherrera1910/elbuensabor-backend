const googleRouter = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

googleRouter.post('/', async (req, res, next) => {
  const { body } = req
  const { email, nombre, apellido, username } = body
  console.log(email)
  const userExiste = await User.findOne({ email })
  if (userExiste) { // SI EL USUARIO YA EXISTE RETORNAMOS SU EMAIL Y EL BOOLEANO DE LOGIN GOOGLE PARA PODER LOGEAR SIN PASSWORD
    return res.json({ email, googleLogin: true })
  } else { // SI EL USUARIO NO EXISTE, LO CREAMOS CON UNA CONTRASEÑA RANDOM Y LO RETORNAMOS CON ELBOOLEANO PARA LOGUEAR DESPUES DE CREARLO
    const claveHash = await bcrypt.hash('elbuensaborclavealeatoria', 10)
    const newUser = new User({
      nombre,
      apellido,
      username,
      email,
      clave: claveHash,
      telefono: 0,
      rol: 'usuario',
      addresses: [],
      pedidos: []
    })
    newUser.save()
      .then(user => res.status(201).json({ email: user.email, googleLogin: true }))
      .catch(error => next(error))
  }
})
module.exports = googleRouter
