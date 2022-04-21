function cors(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Method', 'GET,POST,PUT,DELETE,PATH,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Accept,Content-Type,X-Request-With,Origin')

    next()
}

module.exports = () => cors