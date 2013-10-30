var path = require('path')
var q    = require('qunitjs')
var qTap = require('qunit-tap')

qTap(q, console.log.bind(console))
q.init()
q.updateRate = 0

q.assert.is = q.assert.strictEqual
q.assert.like = function (str, reg, mes) {
    q.assert.ok(reg.test(str), mes)
}

//
var carom, app
q.module('モジュールの読み込み')
q.test('require("carom.js")', function (t) {
    carom = require(path.join( __dirname, '..'))
    t.ok(carom.constructor, 'exists carom.constructor')
})

q.module('var app = Object.create(carom).constructor(config)')
q.test('Object.create(carom).constructor(config) で appは生成できるか', function (t) {
    var extlib = path.join( __dirname, 'lib')

    app = Object.create(carom).constructor({extlib: extlib})

    t.ok(app.constructor, 'exists app.constructor')
    t.ok(app._middles,    'exists app._middles')
    t.ok(app._configs,    'exsits app._configs')
    t.is(app._configs.extlib, extlib, 'exists app._configs.extlib')
    t.ok(app.server,      'exists app.server')
})

q.test('.load(modulePath)でミドルウェアを読み込めるか', function (t) {
    t.ok(app.load('favicon'), 'app.load("favicon") // use extlib')

    t.throws(function () { app.load('no_exists_module') }
      , /cannot find module/i
      , '存在しないモジュールパスを指定した場合エラーを投げる'
    )
})
q.test('.use(modulePath_or_function, opt)でミドルウェアを._middlesに登録できるか', function (t) {
    t.throws(function () { app.use({messge: 'not_function'}) }
      , /middleware" must be "function/
      , '第一引数が文字列（ファイルパス）か関数以外はエラーを投げる'
    )

    app.use('favicon')
    t.is(typeof app._middles[0], 'function', 'typeof app._middles[0] === "function"')

    app.use(function (req, res, next) { next() })
    t.is(typeof app._middles[1], 'function', 'typeof app._middles[1] === "function"')
})

var ee = require('events')
q.module('.onRequest(req, res)', {
    setup: function () {
        var res = this.res = new ee.EventEmitter
        res.init = function () {
            this.buf = []
            this.statusCode = null
            this.headers = {}
        }
        res.writeHead = function (statusCode, headers) {
            this.statusCode = statusCode
            this.headers = headers
        }
        res.write = function (data) {
            data && this.buf.push(data)
        }
        res.end = function (data) {
            this.write(data)
            this.emit('end')
        }
        res.init()


        this.app = Object.create(carom).constructor({
            extlib: path.join(__dirname, 'lib')
        })
        .use('favicon')
        .use(function (req, res, next) {
            res.writeHead(404, {'content-type': 'application/json'})
            res.end(req.url + ' not found')
        })
    }
  , teardown: function () {
        this.res.init()
    }
})
q.asyncTest('* setupした app, res が機能するか', function (t) {
    t.ok(this.app, 'exists app')
    t.is(this.app._middles.length, 2, 'app._middles.length === 2')

    this.res.on('end', function () {
        t.ok(true, 'called .emit("end")')
        q.start()
    })

    this.res.end()
})
q.asyncTest('リクエストURLが "/favicon.ico" の場合', function (t) {
    var app = this.app
    var res = this.res

    res.on('end', function () {
        t.is(res.statusCode, 200, 'res.statusCode === 200')
        t.deepEqual(res.headers, {'content-type': 'image/x-icon'}, 'res.headers {"content-type": "image/x-icon"}')
        t.deepEqual(res.buf, [], 'bodyは返さない')
        q.start()
    })

    app.onRequest({url: '/favicon.ico'}, res)
})
q.asyncTest('リクエストURLが "/" の場合', function (t) {
    var app = this.app
    var res = this.res

    res.on('end', function () {
        t.is(res.statusCode, 404, 'res.statusCode === 404')
        t.deepEqual(res.headers, {'content-type': 'application/json'}, 'res.headers {"content-type": "application/json"}')
        t.is(res.buf[0], '/ not found', 'body = / not found')
        q.start()
    })

    app.onRequest({url: '/'}, res)
})
