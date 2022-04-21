const STRING_PAGE_RANGE_EXCEEDS_LIMIT = 'pageRangeExceedsLimit'
const STRING_ERROR                    = 'error'
const STRING_ERROR_INVALID_PAGE_RANGE = 'errorInvalidPageRange'
const STRING_YOUR_FILE_IS_READY       = 'yourFileIsReady'
const STRING_WAIT_DOWNLOADING_NOW     = 'waitDownloadingNow'
const STRING_DOWNLOAD_NOW             = 'downloadNow'
const STRING_PAGES                    = 'pages'
const STRING_PAGE_FILTER_ALL          = 'pageFilterAll'
const STRING_PAGE_FILTER_ODD          = 'pageFilterOdd'
const STRING_PAGE_FILTER_EVEN         = 'pageFilterEven'
const STRING_PAGE_FILTER_CUSTOM       = 'pageFilterCustom'

function getMessage(name, placeholders) {
    if (placeholders)
        return chrome.i18n.getMessage(name, placeholders)
    else
        return chrome.i18n.getMessage(name)
}

module.exports = {
    STRING_PAGE_RANGE_EXCEEDS_LIMIT,
    STRING_ERROR,
    STRING_ERROR_INVALID_PAGE_RANGE,
    STRING_YOUR_FILE_IS_READY,
    STRING_WAIT_DOWNLOADING_NOW,
    STRING_DOWNLOAD_NOW,
    STRING_PAGES,
    STRING_PAGE_FILTER_ALL,
    STRING_PAGE_FILTER_ODD,
    STRING_PAGE_FILTER_EVEN,
    STRING_PAGE_FILTER_CUSTOM,
    getMessage
}