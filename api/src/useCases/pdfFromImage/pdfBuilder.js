const PDFDocument = require('pdfkit')

function fromImageList(images, res) {
    const doc = new PDFDocument({ autoFirstPage: false })
    doc.pipe(res)

    images.forEach(image => {
        doc.addPage({
            margin: 0,
            size: [ 1000, 1000 ]
        }).image(image, 0, 0, {
            fit: [ 1000, 1000 ],
            align: 'center',
            valign: 'center'
        })
    })

    doc.end()
}

module.exports = {
    fromImageList
}