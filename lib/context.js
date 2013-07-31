var util   = require('util');
var events = require('events');
var qs     = require('querystring');
var url    = require('url');
var mime   = require('mime');

function Context (req, res) {
    events.EventEmitter.call(this);

    this.request  = req;
    this.response = res;

    var that = this;

    this.raw  = '';
    this.urls = url.parse(req.url, true);
    this.data = this.urls.query;

    req.on('data', function (c) { that.raw += c; });
    req.once('end', function () {
        that._bodyParse(req);
        that.emit('request.end', that.data, that.raw);
    });
}

util.inherits(Context, events.EventEmitter);

Context.parsers = {
    'application/json': JSON.parse
  , 'application/x-www-form-urlencoded': qs.parse
};
Context.types = {
    json: JSON.stringify
  , text: qs.stringify
  , html: JSON.stringify
};

Context.extend  = function (method, fn) {
    Context.prototype[method] = function () {
        return fn.apply(this, arguments);
    };
};


Context.extend('_bodyParse', function (req) {
    var contentType = req.headers['content-type'], _data;

    if (this.raw && typeof Context.parsers[contentType] === 'function') {
        _data = Context.parsers[contentType](this.raw);
        this.data = Object.keys(_data).reduce(function (data, key) {
                        data[key] = _data[key]; return data;
                    }, this.data);
    }
});

Object.keys(Context.types).forEach(function (type) {
    Context.extend( type, function (body, statusCode, headers) {
        if (! headers) {
            if (typeof statusCode === 'object' && statusCode !== null) {
                headers    = statusCode;
                statusCode = 200;
            }
        }
        if (typeof headers !== 'object' || headers === null) headers = {};
        if (typeof statusCode !== 'number') statusCode = 200;
        if (typeof body === 'object' && body !== null)
            body = Context.types[type](body);

        if (body && typeof body !== 'string') body = String(body);

        headers['content-type'] = mime.lookup(type) + '; charset=utf-8';
        if (! headers['content-length'])
            headers['content-length'] = (body) ? Buffer.byteLength(body) : 0;

        if (! headers['connection']) headers['connection'] = 'close';

        this.response.writeHead(statusCode, headers);
        this.response.end(body);
    });
});

Context.extend('redirect', function (_location) {
    this.response.writeHead(302, {Location: _location});
    this.response.end();
});


module.exports = Context;
Context.Context = Context;

