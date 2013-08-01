module.exports = function () {
    return function (req, res) {
        var http = require('http');
        this.json({
            reason: http.STATUS_CODES[404]
          , message: req.url + ' not found'
        }, 404);
    };
};
