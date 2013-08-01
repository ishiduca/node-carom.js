module.exports = function () {
    return function (req, res, next) {
        if (req.url !== '/favicon.ico') return next();

        res.writeHead(200, {'content-type': 'image/x-icon'});
        res.end();
    };
};
