const axios = require('axios')

async function fetchImage(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' })

    return response.data
}

module.exports = fetchImage