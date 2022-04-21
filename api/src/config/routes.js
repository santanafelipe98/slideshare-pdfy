const { Router }              = require('express')
const PdfFromImageController = require('../useCases/pdfFromImage/PdfFromImageController')

module.exports = app => {
    const routes = Router()

    app.use('/api', routes)

    // Rotas

    routes.get('/pdf-from-image', PdfFromImageController)
}