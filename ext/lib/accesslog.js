module.exports = function (logPath) {
    var fs = require('fs'), ws;
    if (logPath) ws = fs.createWriteStream(logPath);

    return function (req, res, next) {
        var end = res.end;
        res.end = function () {

            var line = [
                (new Date()).toUTCString()
              , req.method.toUpperCase()
              , req.url
              , '-'
              , res.statusCode
            ].join(' ');
			line += '\n';

            ws && typeof ws.write === 'function' && ws.write(line);
            process.stdout.write(line);

            end.apply(this, arguments);
        };

        next();
    };
};
