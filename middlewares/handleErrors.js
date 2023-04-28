module.exports = (error, req, res, next) => {
  console.error(error.name)
  console.error(error)
  if (error.name === 'CastError') {
    res.status(400).end()
  } else if (error.name === 'MongoServerError') {
    res.status(406).json(error.keyValue).end()
  } else if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Falta el token de inicio de sesión o es inválido'
    })
  } else {
    res.status(500).end()
  }
}
