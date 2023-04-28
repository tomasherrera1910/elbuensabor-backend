const mongoose = require('mongoose')

const connectionString = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.n4rem.mongodb.net/${process.env.DBNAME}
`

mongoose.connect(connectionString)
  .then(() => console.log('db connected'))
  .catch(e => console.error(`error al conectar db: ${e}`))
