# carom.js

a foundation for web framework.

```js
var carom = require('carom.js');
var app   = carom.app;


// set config
app.config.set('port', 3000);
app.config.set('accesslog', './access.log');
app.config.set('errorlog', './error.log');

// setup middleware
app.use('favicon');
app.use('accesslog', app.config.get('accesslog'));
app.use('errorlog', app.config.get('errorlog'));
app.use('router', app);
app.use('404');


app.router.GET('/', function (req, res) {
    this.text('hello world');
});

app.server.listen(app.config.get('port'));
```


