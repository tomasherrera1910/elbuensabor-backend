module.exports = (error, req, res, next) => {
  // console.error(error.name)
  // console.error(error)
  if (error.name === 'CastError') {
    res.status(400).end()
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    let message = ''
    if (error.message.includes('email')) {
      message = 'El email ya está en uso'
    } else if (error.message.includes('username')) {
      message = 'El nombre de usuario ya está en uso'
    }
    res.status(406).send(message).end()
  } else if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Falta el token de inicio de sesión o es inválido'
    }).end()
  } else {
    res.status(500).end()
  }
}
