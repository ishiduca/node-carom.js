var path = require('path');
var http = require('http');

var app = {_middles:[]};

app.load = function (filePath, opt) {
    var m; try {
        m = require(filePath)(opt);
    } catch (err) {
        try {
            m = require(
                path.join(this.config.get('extlib'), filePath)
            )(opt);
        } catch (err) {
            throw err;
        }
    }

    return m;
};

app.use = function (f, _opt) {
    if (typeof f === 'string') f = this.load(f, _opt);
    if (typeof f !== 'function')
        throw new TypeError('"middleware" must be "function"');

    this._middles.push(f);

    return this;
};

app.onRequest = function (req, res) {
    var context = new (app.config.get('Context'))(req, res);
    var help = function (n) {
        if (this.length > 0 && typeof this[n] === 'function')
            this[n].apply( context, [
                req, res, function _next () { help(n + 1) }
            ]);
    }.bind(app._middles);

    help(0);
};

app.server = http.createServer(app.onRequest);

//
app.config = { _configs: {} };
app.config.set = function (key, val) {
    this._configs[key] = val;
    return this;
};
app.config.get = function (key) {
    return this._configs[key];
};
app.config.remove = function (key) {
    delete this._configs[key];
    return this;
};

// default init
app.config.set('root',   path.dirname(process.argv[1]));
app.config.set('extlib', path.join(app.config.get('root'), 'lib'));
app.config.set('Context', require('./context'));

module.exports = app;

module.exports.init = function (params) {
    params || (params = {});

    if (typeof params.Context !== 'function')
        params.Context = require('./context');

    Object.keys(params).forEach(function (key) {
        app.config.set(key, params[key]);
    });

    return app;
};

