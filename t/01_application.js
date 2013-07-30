var path = require('path');
var test = require('tape');

test('デフォルトのappが呼べるか', function (t) {
    var app = require(path.join( __dirname, '../lib/application'));

    t.ok( app );
    t.equal( app.config.get('root'), __dirname);
    t.equal( app.config.get('extlib'), path.join( __dirname, 'lib'));
    t.deepEqual( app.config.get('Context'), require(path.join( __dirname, '../lib/context')));

    t.end();
});

test('app.init() で デフォルトのappが呼べるか', function (t) {
    var app = require(path.join( __dirname, '../lib/application')).init();

    t.ok( app );
    t.equal( app.config.get('root'), __dirname);
    t.equal( app.config.get('extlib'), path.join( __dirname, 'lib'));
    t.deepEqual( app.config.get('Context'), require(path.join( __dirname, '../lib/context')));

    t.end();
});

test('app.init(params)で app が呼べるか', function (t) {
    var Cont = function () {};
    var app = require(path.join( __dirname, '../lib/application')).init({
        root: path.join( __dirname, '..')
      , extlib: path.join( __dirname, '../lib')
      , Context: Cont
    });

    t.ok( app );
    t.equal( app.config.get('root'), path.join(__dirname, '..'));
    t.equal( app.config.get('extlib'), path.join( __dirname, '../lib'));
    t.deepEqual( app.config.get('Context'), Cont);

    t.end();
});

test('app.use(function () {})', function (t) {
    var app = require(path.join( __dirname, '../lib/application'));

	app.config.set('root', path.dirname(process.argv[1]));
	app.config.set('extlib', path.join(app.config.get('root'), 'lib'));

    var results = [];
    app.use(function (req, res, next) {
        req.url === '/' && results.push('first');
        req.stop || next();
    });
    app.use(function (req, res, next) {
        results.push('second');
		req.url === '/not/found' && next();
    });
	app.use('404', {message: 'not found', push: function (mes) { results.push(mes) }});

    app.onRequest({url: '/'}, {});
    t.deepEqual( results, [ 'first', 'second' ]);

    results = [];
    app.onRequest({}, {});
    t.deepEqual( results, [ 'second' ]);

    results = [];
    app.onRequest({stop: true, url: '/'}, {});
    t.deepEqual( results, [ 'first' ]);

    results = [];
    app.onRequest({url: '/not/found'}, {});
    t.deepEqual( results, [ 'second', 'not found' ]);

    t.end();
});
