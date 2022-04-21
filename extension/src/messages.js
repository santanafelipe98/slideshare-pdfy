const MESSAGE_TYPE_GET_PDF            = 'GET_PDF'
const MESSAGE_TYPE_DOWNLOAD_FILE      = 'DOWNLOAD_FILE'
const MESSAGE_TYPE_GET_SLIDE_METADATA = 'GET_SLIDE_METADATA'

function sendMessageToContentScript(tabID, type, data, respCallback) {
    chrome.tabs.sendMessage(tabID, { type, data }, null, respCallback)
}

function sendMessageToBackgroundScript(type, data, respCallback) {
    chrome.runtime.sendMessage({ type, data }, null, respCallback)
}

module.exports = {
    MESSAGE_TYPE_DOWNLOAD_FILE,
    MESSAGE_TYPE_GET_PDF,
    MESSAGE_TYPE_GET_SLIDE_METADATA,
    sendMessageToBackgroundScript,
    sendMessageToContentScript
}