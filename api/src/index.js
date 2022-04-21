const app  = require('./config/server')
const PORT = process.env.PORT || 3033

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
})