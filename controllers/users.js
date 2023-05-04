const userRouter = require('express').Router()
const userExtractor = require('../middlewares/userExtractor')
const User = require('../models/User')
const bcrypt = require('bcrypt')

userRouter.get('/', (req, res, next) => {
  User.find({})
    .then(data => res.json(data))
    .catch(error => next(error))
})

userRouter.get('/:id', (req, res, next) => {
  const { id } = req.params
  User.findById(id)
    .then(user => {
      user
        ? res.json(user)
        : res.status(404).end()
    })
    .catch(error => next(error))
})

userRouter.post('/', async (req, res, next) => {
  const { nombre, apellido, username, email, clave, telefono } = req.body

  if (!nombre || !apellido || !username || !email || !clave || !telefono) { res.json({ missingField: 'Todos los campos son obligatorios!' }).end() }

  const claveHash = await bcrypt.hash(clave, 10)
  const newUser = new User({
    nombre,
    apellido,
    username,
    email,
    clave: claveHash,
    telefono,
    rol: 'usuario',
    addresses: [],
    pedidos: []
  })
  newUser.save()
    .then(() => res.status(201).json({ message: 'Usuario creado con éxito!' }))
    .catch(error => next(error))
})

userRouter.put('/', userExtractor, async (req, res, next) => {
  const id = req.userId
  console.log({ id })
  const { nombre, apellido, clave, telefono } = req.body
  let passwordHash

  if (clave) { passwordHash = await bcrypt.hash(clave, 10) }
  const updatedUser = {
    nombre,
    apellido,
    clave: passwordHash,
    telefono
  }
  User.findByIdAndUpdate(id, updatedUser, { new: true })
    .then(user => res.json(user))
    .catch(error => next(error))
})
module.exports = userRouter
