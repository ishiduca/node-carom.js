var path = require('path')
var q    = require('qunitjs')
var qTap = require('qunit-tap')
// qunit setup
qTap(q, console.log.bind(console))
q.init()
q.config.updateRate = 0
// qunit alias
q.assert.is = q.assert.strictEqual
q.assert.like = function (str, reg, mes) {
    this.ok(reg.test(str), mes)
}

// app setup
var carom = require(path.join( __dirname, '..'))
var app   = Object.create(carom).constructor({
    context: {
        end: function (data, statusCode, headers) {
            statusCode || (statusCode = 200)
            headers || (headers = {})
            headers['content-type'] = 'text/plain; charset=utf-8'
            headers['content-length'] = Buffer.byteLength(data)

            this.res.writeHead(statusCode, headers)
            this.res.end(data)
        }
    }
})

var port  = 3000

// set middleware
app.use(function (req, res, next) {
    var body = {
        method: req.method.toUpperCase()
      , headers: req.headers
      , url: req.url
    }

    if (body.method === 'POST') {
        body.body = ''
        req.on('data', function (c) { body.body += c })
        req.on('end', function () {
            this.end(JSON.stringify(body))
        }.bind(this))
    } else {
        this.end(JSON.stringify(body))
    }
})


var http = require('http')
q.module('app._config.context.end(body, statusCode, headers)が働くか', {
    setup: function () {
        app.server.listen(port)
        console.log('# ### server start to listen on port "%d"', port)
    }
  , teardown: function () {
        console.log('# ### server close ...')
        app.server.close()
    }
})
q.asyncTest('GET /get', function (t) {
    var req = http.get('http://localhost:' + String(port) + '/get', function (res) {
        var data = ''
        res.on('data', function (c) { data += c })
        res.on('end', function () {
            data = JSON.parse(data)
            t.is(res.statusCode, 200)
            t.is(data.url, '/get')
            q.start()
        })
    })
})
q.asyncTest('POST /post "foo"', function (t) {
    var body = 'foo'
    var opt = {
        hostname: 'localhost'
      , port: port
      , path: '/post'
      , method: 'POST'
    }
    var req = http.request(opt, function (res) {
        var data = ''
        res.on('data', function (c) { data += c })
        res.on('end', function () {
            data = JSON.parse(data)
            t.is(res.statusCode, 200)
            t.is(data.url, '/post')
            t.is(data.body, body)
            q.start()
        })
    })
    req.end(body)
})
