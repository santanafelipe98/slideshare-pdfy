const MESSAGE_TYPE_GET_SLIDE_METADATA = 'GET_SLIDE_METADATA'
const MESSAGE_TYPE_DOWNLOAD_FILE      = 'DOWNLOAD_FILE'

/**
 * Obtém dados do slide da página atual
 * @param {function} sendResponse 
 */
function getSlideMetadata(sendResponse) {
    const data = {}

    const slideTitle = document.querySelector('.j-title-breadcrumb')
    const imgs       = document.querySelectorAll('.slide-image')
    const urls       = []

    imgs.forEach(img => {
        const srcSet              = img.srcset.split(',')
        const bestQualityImageURL = srcSet[srcSet.length - 1].replace(/ [0-9]+w/gi, '')

        urls.push(bestQualityImageURL)
    })

    data['title']      = slideTitle.textContent.trim().replace(/[\n\t]/, '')
    data['images_url'] = urls
    data['page_count'] = urls.length

    sendResponse(data)
}

/**
 * Realiza o download do arquivo PDF
 * @param {object} data Dados do arquivo
 * @param {function} sendResponse Callback resposta
 */
function downloadFile(data, sendResponse) {
    const buffer = new Uint8Array(data.data).buffer

    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href  = url
    link.download = `${Date.now()}.pdf`
    document.body.append(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    sendResponse({ success: true })
}

/**
 * Trata mensagens
 * @param {object} message Objeto mensagem
 * @param {object} _ 
 * @param {function} sendResponse Callback resposta
 */
function handleMessage(message, _, sendResponse) {
    const { type, data } = message

    switch (type) {
        case MESSAGE_TYPE_GET_SLIDE_METADATA:
            getSlideMetadata(sendResponse)
            break
        case MESSAGE_TYPE_DOWNLOAD_FILE:
            downloadFile(data, sendResponse)
            break
    }
}

chrome.runtime.onMessage.addListener(handleMessage)