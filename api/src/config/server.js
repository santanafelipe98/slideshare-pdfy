const express       = require('express')
const app           = express()
const cors          = require('../middlewares/cors')
const dotenv        = require('dotenv')
const routesConfig  = require('./routes')

dotenv.config()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

routesConfig(app)

module.exports = app