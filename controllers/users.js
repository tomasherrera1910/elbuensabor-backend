const userRouter = require('express').Router()
const userExtractor = require('../middlewares/userExtractor')
const User = require('../models/User')
const bcrypt = require('bcrypt')

userRouter.get('/', userExtractor, async (req, res, next) => {
  const id = req.userId
  const loggedUser = await User.findById(id)
  if (loggedUser.rol === 'admin') {
    User.find({})
      .then(data => res.json(data))
      .catch(error => next(error))
  } else {
    res.status(401).json({ error: 'Only admins can view all users' })
  }
})

userRouter.get('/get/:id', userExtractor, async (req, res, next) => {
  const { id } = req.params
  const userLoggedId = req.userId
  const loggedUser = await User.findById(userLoggedId)
  if (loggedUser.rol === 'admin') {
    User.findById(id)
      .then(user => {
        user
          ? res.json(user)
          : res.status(404).end()
      })
      .catch(error => next(error))
  } else {
    res.status(401).json({ error: 'Only admins can view a specific user' })
  }
})

userRouter.get('/profile', userExtractor, async (req, res, next) => {
  const id = req.userId
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
userRouter.put('/:id', userExtractor, async (req, res, next) => {
  const userLoggedId = req.userId
  const userLogged = await User.findById(userLoggedId)
  if (userLogged.rol === 'admin') {
    const { rol } = req.body
    const { id } = req.params

    const updatedUser = {
      rol
    }
    User.findByIdAndUpdate(id, updatedUser, { new: true })
      .then(user => res.json(user))
      .catch(error => next(error))
  } else {
    res.status(401).json({ error: 'Only admins can update role of a user' })
  }
})
module.exports = userRouter
