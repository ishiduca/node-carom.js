var path = require('path');
var Context = require(path.join( __dirname, '../lib/context'));
var test = require('tape');

var stream = require('stream');
var _req = new stream.Stream;
var _res = new stream.Stream;

_req.headers = {};
_req.url  = 'http://dummy.org/hoge?foo=bar';

_res.buf = [];
_res.writeHead = function (statusCode, headers) {
    this.statusCode = statusCode;
    this.headers    = headers;
};
_res.end = _res.write = function (data, setEnc) {
    data && this.buf.push(String(data));
};
_res.clear = function () {
    this.statusCode = null;
    this.headers = null;
    this.buf = [];
};


test('Contextの呼び出し', function (t) {
    t.equal( typeof Context, 'function');
    t.ok( new Context(_req, _res) );
    t.end();
});

test('new Context(req, res)', function (t) {
    var z = new Context(_req, _res);
    _req.headers['content-type'] = 'application/x-www-form-urlencoded';

    var strs = [ 'A=a&', 'B=bb&', 'C=ccc' ];
    var i = 0, iid = setInterval(function () {
        if (strs.length > i)
            return z.request.emit('data', strs[i++]);

        z.request.emit('end');
        clearInterval(iid);
    }, 100);

    z.once('request.end', function () {
        t.equal( z.raw, 'A=a&B=bb&C=ccc' );
        t.deepEqual( z.data, {A: 'a', B: 'bb', C: 'ccc', foo: 'bar'});

        z.request.headers = {};
        z.response.clear();
        t.end();
    });
});

test('Context.extend(method, fn)', function (t) {
    Context.extend('streaming', function (arry, time) {
        var res = this.response;

        res.writeHead(200, {'content-type': 'text/plain'});
        var i = 0, iid = setInterval(function () {
            if (arry.length > i) return res.write(arry[i++]);

            res.end();
            res.emit('end');
            clearInterval(iid);
        }, time);
    });

    var z = new Context(_req, _res);

    t.equal( typeof z.streaming, 'function');

    z.response.once('end', function () {
        t.equal( z.response.statusCode, 200);
        t.deepEqual( z.response.buf, [ "1", "2", "3" ]);

        z.response.clear();
        t.end();
    });

    z.streaming([1, 2, 3], 100);
});

test('z.redirect("hoge")', function (t) {
    var z = new Context(_req, _res);

    t.equal( typeof z.redirect, 'function');

    z.redirect('/hoge');

    t.equal( _res.statusCode, 302);
    t.deepEqual( _res.headers, {Location: '/hoge'});

    z.response.clear();
    t.end();
});

test('z.text("str")', function (t) {
    var z = new Context(_req, _res);
    z.text('hello');

    t.equal(z.response.statusCode, 200);
    t.equal(z.response.headers['content-type'], 'text/plain; charset=utf-8');
    t.equal(z.response.headers['content-length'], ('hello').length);
    t.equal(z.response.headers['connection'], 'close');
    t.deepEqual(z.response.buf, ['hello']);

    z.response.clear();
    t.end();
});

test('z.html("str")', function (t) {
    var z = new Context(_req, _res);
    z.html('<h1>hello</h1>');

    t.equal(z.response.statusCode, 200);
    t.equal(z.response.headers['content-type'], 'text/html; charset=utf-8');
    t.equal(z.response.headers['content-length'], ('<h1>hello</h1>').length);
    t.equal(z.response.headers['connection'], 'close');
    t.deepEqual(z.response.buf, ['<h1>hello</h1>']);

    z.response.clear();
    t.end();
});

test('z.json("str")', function (t) {
    var z = new Context(_req, _res);
    var s = JSON.stringify({foo: 'bar'});
    z.json(s);

    t.equal(z.response.statusCode, 200);
    t.equal(z.response.headers['content-type'], 'application/json; charset=utf-8');
    t.equal(z.response.headers['content-length'], s.length);
    t.equal(z.response.headers['connection'], 'close');
    t.deepEqual(z.response.buf, [s]);

    z.response.clear();
    t.end();
});

test('z.json({hash})', function (t) {
    var z = new Context(_req, _res);
    var s = {foo: 'bar'};
    z.json(s);

    t.equal(z.response.statusCode, 200);
    t.equal(z.response.headers['content-type'], 'application/json; charset=utf-8');
    t.equal(z.response.headers['content-length'], (JSON.stringify(s)).length);
    t.equal(z.response.headers['connection'], 'close');
    t.deepEqual(z.response.buf, [JSON.stringify(s)]);

    z.response.clear();
    t.end();
});
