var url = require('url')
module.exports = function (args) {
    return function (req, res, next) {
        if (url.parse(req.url).pathname !== '/favicon.ico') return next()

        res.writeHead(200, {'content-type': 'image/x-icon'})
        res.end()
    }
}
