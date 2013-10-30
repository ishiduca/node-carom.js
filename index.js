'use strict'

var path  = require('path')
var carom = {}

carom.load = function (middlewarePath) {
    if (! this._configs.extlib) this._configs.extlib = ''
    var middleware
    var extlib = this._configs.extlib

    try {
        middleware = require(path.join(extlib, middlewarePath))
    } catch (err) {
        middleware = require(middlewarePath)
    }
    return middleware
}

carom.use = function (middleware, opt) {
    if (typeof middleware === 'string')
        middleware = this.load(middleware)(opt)

    if (typeof middleware !== 'function')
        throw new TypeError('"middleware" must be "function"')

    this._middles.push(middleware)

    return this
}

carom.onRequest = function (req, res) {
    var that = this
    var cont = this.context(req, res)
    function _help (n) {
        var middleware = that._middles[n]
        if (typeof middleware !== 'function') return _help(n + 1)

        middleware.apply(cont, [ req, res, function _next () {_help(n+1)} ])
    }

    _help(0)
}

carom.context = function (req, res) {
    var cont = Object.create(this._configs.context || {})
	cont.req = req
	cont.res = res
	return cont
}

carom.constructor = function constructor (opt) {
    opt || typeof opt === 'object' || (opt = {})

    var configs = {}
    Object.keys(opt).forEach(function (key) {
        configs[key] = opt[key]
    })

    var that = this
    this._configs = configs
    this._middles = []
    this.server   = require('http').createServer(this.onRequest.bind(this))

    return this
}

module.exports = carom
module.exports.constructor.prototype = carom
