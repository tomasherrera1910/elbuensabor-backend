const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')

loginRouter.post('/', async (req, res) => {
    const { email, clave } = req.body

    const user = await User.findOne({ email })
    const passwordCorrect = !user ? false
        : await bcrypt.compare(clave, user.clave)
    if (!user || !passwordCorrect) {
        return res.status(401).json({ error: "El mail y/o la contraseña son incorrectos" })
    }
    const userForToken = {
        id: user.id,
        email: user.email
    }
    const token = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: 60 * 60 * 24 * 2
    })
    res.status(202).json({
        username: user.username,
        nombre: user.nombre,
	rol: user.rol,
	id: user.id,
        token
    })
})

module.exports = loginRouter