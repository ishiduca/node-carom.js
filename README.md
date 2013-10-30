# carom.js

a foundation for web framework.

### example

```js
var carom = require('carom.js')
var app   = Object.create(carom).constructor({
    extlib: __dirname + '/lib'
})

// set middleware
app.use('favicon')
   .use('accesslog', {logPath: __dirname + '/access.log'})
   .use('session')
   .use('router', {app: app})
   .use(function is404 (req, res, next) {
        res.writeHead(404)
        res.end(req.url + ' not found')
   })

app.router.GET('/', function (req, res) {
    res.end('hello\n')
})
app.router.POST('/', function (req, res) {
    var context = this
    res.end(context.data)
})

app.server.listen(3000, function () {
    console.log('server start to litesn on port "%d"', 3000)
})
```


## create App

```js
var config = {
    extlib: __dirname + '/middleware'
  , context: {}
}
var carom = require('carom.js')
var app   = Object.create(carom).constructor(config)
```

* __config.extlib__ : path to a directory to place the middleware
* __config.context__ : object that is the prototype of the context object


## method

### .use(middlewarePath_or_function[, arg])

* __middlewarePath_or_function__ : path to a middleware, or function
* __arg__ : an argument of middleware


## middleware

```js
// ex: accesslog.js
module.exports = function (arg) {
    var ws = require('fs').createWriteStream(arg.logPath, arg.option)
    return function middleware (req, res, next) {
        var end = res.end
        res.end = function () {
            end.apply(this, arguments)
            ws.write(
                (new Date).toUTCString() + ' '
              + req.method + ' '
              + req.url
            )
        }

        next()
    }
}
```
