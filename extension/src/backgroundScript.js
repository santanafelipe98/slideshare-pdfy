const {
    STRING_PAGE_RANGE_EXCEEDS_LIMIT,
    STRING_ERROR_INVALID_PAGE_RANGE,
    getMessage
} = require('./locale')
const {
    PAGE_FILTER_ALL,
    PAGE_FILTER_EVEN,
    PAGE_FILTER_ODD
} = require('./pageFilters')
const {
    sendMessageToContentScript,
    MESSAGE_TYPE_GET_PDF,
    MESSAGE_TYPE_DOWNLOAD_FILE
} = require('./messages')
const {
    JOB_STATUS_DONE,
    JOB_STATUS_ERROR,
    JOB_STATUS_RUNNING
} = require('./jobStatus')

const { getCurrentTab } = require('./utils')

const BASE_URL = 'https://slideshare-pdfy-api.onrender.com/api'
let jobQueue   = {}

/**
 * Realiza configuração padrão da extensão
 */
function initialize() {
    chrome.storage.local.set({
        jobQueue
    })
}

/**
 * Libera recursos quando a extensão é desinstalada
 */
function release() {
    chrome.storage.local.clear()
}

/**
 * Trata mensagens
 * @param {object} message Objeto mensagem
 * @param {*} _ 
 * @param {function} sendResponse Callback resposta
 * @returns {boolean}
 */
function handleMessage(message, _, sendResponse) {
    const { type, data } = message

    switch (type) {
        case MESSAGE_TYPE_GET_PDF:
            buildPDF(data.imageUrls, data.filter, sendResponse)
            break
    }

    return true
}

/**
 * Define um job para uma determinada aba
 * @param {number} tabId Id da aba
 * @param {object} job 
 * @param {function} callback Função callback
 */
function setJob(tabId, job, callback) {
    chrome.storage.local.set({ jobQueue: { ...jobQueue, [tabId]: job } }, callback)
}

/**
 * Atualiza jobs locais
 * @param {*} changes 
 */
function updateJobs(changes) {
    if ('jobQueue' in changes) {
        jobQueue = changes['jobQueue'].newValue
    }
}

/**
 * Cria PDF
 * @param {String[]} imageUrls Lista de urls das imagens
 * @param {string} filter Tipo de filtro das páginas
 * @param {*} sendResponse Callback resposta
 */
function buildPDF(imageUrls, filter, sendResponse) {
    let filteredPages = filterPages(imageUrls, filter);

    let promise = fetch(
            `${BASE_URL}/pdf-from-image?images_url=${filteredPages.join(',')}`,
            {
                method: 'get',
            }
    )

    getCurrentTab().then(tab => {
        setJob(tab.id, { status: JOB_STATUS_RUNNING })
        showBadge('info', 'run')

        let response;

        promise.then(res => {
            response = res
            return response.arrayBuffer()
        }).then(arrayBuffer => {
            setJob(tab.id, { status: JOB_STATUS_DONE })
            clearBadge()

            const payload = {
                data: Array.from(new Uint8Array(arrayBuffer)),
                contentType: response.headers.get('content-type')
            }

            downloadFile(tab.id, payload, sendResponse)
        }).catch(e => {
            sendResponse({
                error: e.message
            })
    
            setJob(tab.id, { status: JOB_STATUS_ERROR, errorMessage: e.message })
            showBadge('danger', 'err')
        })
    }).catch(e => {
        sendResponse({
            error: e.message
        })
    })
}

/**
 * 
 * @param {number} tabId Id da aba
 * @param {object} data Dados do arquivo PDF
 * @param {function} callback Callback resposta
 */
function downloadFile(tabId, data, callback) {
    sendMessageToContentScript(tabId, MESSAGE_TYPE_DOWNLOAD_FILE, data, callback)
}

/**
 * Filtra páginas com base em um determinado filtro
 * @param {String[]} pageList Lista de páginas
 * @param {string} filter Tipo de filtragem
 * @returns {String[]} Páginas filtradas
 */
function filterPages(pageList, filter) {
    switch (filter) {
        case PAGE_FILTER_EVEN:
            return pageList.filter((_, i) => (i + 1) % 2 === 0)
        case PAGE_FILTER_ODD:
            return pageList.filter((_, i) => (i + 1) % 2 === 1)
        case PAGE_FILTER_ALL:
            return pageList
        default:
            if (filter.length === 0)
                return pageList

            return slicePages(pageList, filter)
    }
}

/**
 * Seleciona páginas específicas
 * @param {string[]} pageList Lista de páginas
 * @param {string} range Intervalo de páginas
 * @returns {string[]} Lista de páginas
 */
function slicePages(pageList, range) {
    const values = range.split(',')
    let   pages  = []

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
                        getMessage(STRING_PAGE_RANGE_EXCEEDS_LIMIT, pageList.length)
                    )
                }

                if (endAt < pageList.length) {
                    let slice = pageList.slice(startAt - 1, endAt)
                    pages = [ ...pages, ...slice ]
                } else {
                    throw new RangeError(
                        getMessage(STRING_PAGE_RANGE_EXCEEDS_LIMIT, pageList.length)
                    ) 
                }
            } else {
                throw new RangeError(getMessage(STRING_ERROR_INVALID_PAGE_RANGE))
            }
        } else {
            if (isNaN(sanitizedVal))
                throw new RangeError(getMessage(STRING_ERROR_INVALID_PAGE_RANGE))

            if (val > pageList.length) {
                throw new RangeError(getMessage(STRING_PAGE_RANGE_EXCEEDS_LIMIT, pageList.length))
            }

            pages.push(pageList[parseInt(sanitizedVal) - 1])
        }
    })

    return pages
}

/**
 * Exibe badge
 * @param {string} type Estilo do badge 
 * @param {string} text Texto do badge
 */
function showBadge(type = 'info', text) {
    let color;

    switch (type) {
        case 'info':
            color = '#1446A0'
            break
        case 'success':
            color = '#2DD881'
            break
        case 'danger':
            color = '#DB3069'
            break
    }
    
    chrome.action.setBadgeBackgroundColor({ color })
    chrome.action.setBadgeText({ text })
}

/**
 * Esconde badge
 */
function clearBadge() {
    chrome.action.setBadgeText({ text: '' })
}

chrome.runtime.onInstalled.addListener(initialize)
chrome.storage.onChanged.addListener(updateJobs)
chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.setUninstallURL('', release)