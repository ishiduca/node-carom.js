# carom.js

a foundation for web framework.

```js
var carom = require('carom');
var app   = carom.app;

app.config.set('port', 3000);
app.config.set('accesslog', './access.log');
app.config.set('errorlog', './error.log');

app.use('router', app);

app.router.GET('/', function (req, res) {
    this.text('hello world');
});

app.server.listen(app.config.get('port'));
```


