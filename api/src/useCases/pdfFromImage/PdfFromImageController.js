const fetchImage = require('./fetchImage')
const PDFBuilder = require('./pdfBuilder')

async function handler(req, res) {
    try {
        if (req.query['images_url']) {
            const imagesUrl = req.query['images_url'].split(',')
            const images    = await Promise.all(imagesUrl.map(url => fetchImage(url)))
            
            PDFBuilder.fromImageList(images, res)
        } else {
            return res.status(400).json({
                error: 'No image data provided'
            })
        }
    } catch (e) {
        return res.status(500).json({
            error: e.toString()
        })
    }
}

module.exports = handler