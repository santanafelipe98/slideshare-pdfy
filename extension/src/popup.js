require('../styles/popup.css')

const  {
    MESSAGE_TYPE_GET_SLIDE_METADATA,
    MESSAGE_TYPE_GET_PDF,
    sendMessageToBackgroundScript,
    sendMessageToContentScript
} = require('./messages')

const { PAGE_FILTER_CUSTOM } = require('./pageFilters')
const {
    JOB_STATUS_DONE,
    JOB_STATUS_ERROR,
    JOB_STATUS_RUNNING
} = require('./jobStatus')

const {
    STRING_PAGE_RANGE_EXCEEDS_LIMIT,
    STRING_ERROR,
    STRING_ERROR_INVALID_PAGE_RANGE,
    STRING_YOUR_FILE_IS_READY,
    STRING_DOWNLOAD_NOW,
    STRING_WAIT_DOWNLOADING_NOW,
    STRING_PAGES,
    STRING_PAGE_FILTER_ALL,
    STRING_PAGE_FILTER_ODD,
    STRING_PAGE_FILTER_EVEN,
    STRING_PAGE_FILTER_CUSTOM,
    getMessage
} = require('./locale')

const { getCurrentTab } = require('./utils')

const selectPageFilter = document.getElementById('page_filter')
const inputPages       = document.getElementById('pages')
const btnGetPDF        = document.getElementById('btn_get_pdf')
const imageUrls        = document.getElementById('images_url')
const loading          = document.getElementById('loading')
const message          = document.getElementById('message')

/**
 * Envia requisição para criação do arquivo em PDF
 */
async function getPDF() {
    showLoading(true)

    const urls = imageUrls.value.split(',')
    let filter = selectPageFilter.value === PAGE_FILTER_CUSTOM ? inputPages.value : selectPageFilter.value

    sendMessageToBackgroundScript(MESSAGE_TYPE_GET_PDF, {
        imageUrls: urls,
        filter
    }, res => {
        if (res['error']) {
            showMessage('danger', getMessage(STRING_ERROR, [res['error']]))
        } else {
            showMessage('success', getMessage(STRING_YOUR_FILE_IS_READY))
        }

        showLoading(false)
    })
}

/**
 * Exibe mensagem
 * @param {string} type Estilo da mensagem
 * @param {string} text Texto da mensagem
 */
function showMessage(type = 'info', text) {
    if (type === 'info') {
        message.classList.add('message-info')
        message.classList.remove('message-danger')
        message.classList.remove('message-success')
    } else if (type === 'success') {
        message.classList.add('message-success')
        message.classList.remove('message-danger')
        message.classList.remove('message-info')
    } else if (type === 'danger') {
        message.classList.add('message-danger')
        message.classList.remove('message-success')
        message.classList.remove('message-info')
    } else {
        message.classList.remove('message-danger')
        message.classList.remove('message-success')
        message.classList.remove('message-info')
    }

    message.innerHTML = text
}

/**
 * Valida entrada do filtro de páginas
 * @param {*} e 
 */
function validateInputPages(e) {
    const { value }    = e.target

    try {
        const pageList = imageUrls.value.split(',')
        validatePagesRange(pageList, value)
        btnGetPDF.removeAttribute('disabled')
        showMessage('', '')
    } catch (e) {
        showMessage('danger', e.toString())
        btnGetPDF.setAttribute('disabled', true)
    }
}

/**
 * Verifica se há jobs para a aba atual
 * @param {object} changes Mudanças
 */
function checkForJobs(changes) {
    getCurrentTab().then(tab => {
        let tabId = tab.id

        if (tabId in changes) {
            let job = changes[tabId].newValue
    
            if (job) {
                if (job.status === JOB_STATUS_DONE) {
                    showMessage('success', getMessage(STRING_YOUR_FILE_IS_READY))
                    showLoading(false)
                } else if (job.status === JOB_STATUS_RUNNING) {
                    showLoading(true)
                } else if (job.status === JOB_STATUS_ERROR) {
                    showMessage('danger', getMessage(STRING_ERROR, [job.errorMessage]))
                    showLoading(false)
                }
            }
        }
    }).catch(e => {
        showMessage('danger', getMessage(STRING_ERROR, [e.message]))
    })
}

/**
 * Valida intervalo de páginas
 * @param {string[]} pageList Lista de páginas
 * @param {string} range Intervalo de páginas
 * @returns {boolean} Resultado
 */
function validatePagesRange(pageList, range) {
    const values = range.split(',')

    const rangePattern = /^[0-9]+\-[0-9]+/
    values.forEach(val => {
        let sanitizedVal = val.trim()

        if (sanitizedVal.match(rangePattern)) {
            let numbers = sanitizedVal.split('-')

            const startAt = parseInt(numbers[0].trim())
            const endAt   = parseInt(numbers[1].trim())

            if (endAt >= startAt) {

                if (startAt <= 0) {
                    throw new RangeError(
                        getMessage(STRING_PAGE_RANGE_EXCEEDS_LIMIT, [pageList.length])
                    )
                }

                if (endAt >= pageList.length) {
                    throw new RangeError(
                        getMessage(STRING_PAGE_RANGE_EXCEEDS_LIMIT, [pageList.length])
                    ) 
                }
            } else {
                throw new RangeError(getMessage(STRING_ERROR_INVALID_PAGE_RANGE))
            }
        } else {
            if (isNaN(sanitizedVal))
                throw new RangeError(getMessage(STRING_ERROR_INVALID_PAGE_RANGE))

            if (val > pageList.length) {
                throw new TypeError(getMessage(STRING_PAGE_RANGE_EXCEEDS_LIMIT, [pageList.length]))
            }
        }
    })

    return true
}

/**
 * Mostra/esconde campo de páginas
 * @param {*} value 
 */
function shouldEnableDisablePages(value) {
    switch (value) {
        case PAGE_FILTER_CUSTOM:
            inputPages.style.display = 'block'
            break
        default:
            inputPages.style.display = 'none'
            
    }
}

/**
 * Exibe carregamento
 * @param {boolean} value 
 */
function showLoading(value) {
    let btnGetPDFText = document.getElementById('btn_get_pdf_text')

    if (value) {
        selectPageFilter.setAttribute('disabled', true)
        inputPages.setAttribute('disabled', true)
        btnGetPDF.setAttribute('disabled', true)
        btnGetPDFText.textContent = getMessage(STRING_WAIT_DOWNLOADING_NOW)
        loading.style.display = 'inline-block'
    } else {
        selectPageFilter.removeAttribute('disabled')
        inputPages.removeAttribute('disabled')
        btnGetPDF.removeAttribute('disabled')
        btnGetPDFText.textContent = getMessage(STRING_DOWNLOAD_NOW)
        loading.style.display = 'none'
    }
}

/**
 * Exibe placeholder
 * @param {boolean} value 
 */
function showPlaceholder(value) {
    const content     = document.getElementById('content')
    const placeholder = document.getElementById('placeholder')

    if (value) {
        content.style.display     = 'none'
        placeholder.style.display = 'block'
    } else {
        content.style.display = 'flex'
        placeholder.style.display = 'none'
    }
}

/**
 * Exibe informações do slide
 */
async function showSlideMetadata() {
    const tabID = (await getCurrentTab()).id

    sendMessageToContentScript(tabID, MESSAGE_TYPE_GET_SLIDE_METADATA, null, data => {
        if (chrome.runtime.lastError) {
            showPlaceholder(true)
            return
        }

        if (data) {
            const slideThumbnail = document.getElementById('slide_thumbnail')
            const slideTitle     = document.getElementById('slide_title')
            const pageCount      = document.getElementById('slide_page_count')
            const imagesUrl      = document.getElementById('images_url')

            slideThumbnail.innerHTML = `<img src="${data['images_url'][0]}" alt="slide thumbnail">`
            slideTitle.innerText     = data['title']
            pageCount.innerText      = data['page_count']
            imagesUrl.value          = data['images_url'].join(',')
        } else {
            showPlaceholder(true)
        }

    })
}

/**
 * Configura interface
 */
async function initUI() {
    const pagesLabel    = document.getElementById('pages_label')
    const pageCountText = document.getElementById('page_count_text')

    pagesLabel.textContent    = getMessage(STRING_PAGES)
    pageCountText.textContent = getMessage(STRING_PAGES).toLowerCase()

    const options = {
        all: getMessage(STRING_PAGE_FILTER_ALL),
        odd: getMessage(STRING_PAGE_FILTER_ODD),
        even: getMessage(STRING_PAGE_FILTER_EVEN),
        custom: getMessage(STRING_PAGE_FILTER_CUSTOM)
    }

    let o    = Object.keys(options)
    let html = ''
    
    o.forEach(k => {
        html += `<option value="${k}">${options[k]}</option>`
    })

    selectPageFilter.innerHTML = html

    await showSlideMetadata()
    shouldEnableDisablePages('all')
}

await initUI()

selectPageFilter.addEventListener('change', e => shouldEnableDisablePages(e.target.value))
btnGetPDF.addEventListener('click', getPDF)
inputPages.addEventListener('keyup', validateInputPages)

chrome.storage.onChanged.addListener(checkForJobs)