module.exports = function (params) {
    var router = params.router = new (require('router-line').Router);
    var url    = require('url');
    return function (req, res, next) {
        var pathname = url.parse(req.url).pathname;
        var method   = req.method.toUpperCase();
        var result   = router.route(method, pathname);

        if (typeof result === 'undefined') return next();

        this.params = result.params;
        if (method === 'GET' || method === 'DELETE')
            return result.value.apply(this, [req, res]);

        if (method === 'POST' || method === 'PUT')
            this.once('end', function () {
                result.value.apply(this, [req, res]);
            }.bind(this));
    };
};
