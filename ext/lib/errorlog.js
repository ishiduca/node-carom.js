module.exports = function (filePath) {
    var fs = require('fs'), ws;
    if (filePath) ws = fs.createWriteStream(filePath);

    return function (req, res, next) {
        this.on('error', function (err) {
            var str;
            if (typeof err === 'string') str = err;
            if (typeof err === 'object' && err !== null) {
                err.name || (err.name = 'Error');
                str = [ err.name, err.message ].join(': ');
            }

            str = (new Date()).toUTCString() + " " + str + '\n';

            ws && ws.write && ws.write(str);
            process.stderr.write(str);
        });

        next();
    };
};
