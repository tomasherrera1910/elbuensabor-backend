const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')

loginRouter.post('/', async (req, res) => {
    const { email, clave, googleLogin } = req.body
    console.log(googleLogin)
    const user = await User.findOne({ email })
    if(!googleLogin){ // SI GOOGLE LOGIN NO EXISTE HAY QUE VERIFICAR SI EL PASSWORD INGRESADO ES CORRECTO
    const passwordCorrect = !user ? false
        : await bcrypt.compare(clave, user.clave)
    if (!user || !passwordCorrect) {
        return res.status(401).json({ error: "El mail y/o la contraseña son incorrectos" })
    }
    }
    const userForToken = {
        id: user.id,
        email: user.email
    }
    const token = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: 60 * 60 * 24 * 365
    })
    res.status(202).json({
        username: user.username,
        nombre: user.nombre,
	apellido: user.apellido,
	telefono: user.telefono,
	rol: user.rol,
	id: user.id,
        token
    })
})

module.exports = loginRouter