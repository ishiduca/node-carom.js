module.exports = function (params) {
    var filed = require('filed');
    var url   = require('url');
	var path  = require('path');
    return function (req, res, next) {
        var pathname = url.parse(req.url).pathname;
        var _some = function (dir) {
            return pathname.slice(0, dir.length + 1) === (dir + '/');
        };

        params.statics.some(_some)
            ? filed(path.join( params.root, pathname )).pipe(res)
            : next()
        ;
    };
};
