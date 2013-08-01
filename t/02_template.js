var path = require('path');
var test = require('tape');
var Template = require(path.join( __dirname, '../lib/template'));

test('Templateを拡張した my Templateを定義する(requrie "hogan.js")', function (t) {
    Template.engine('hogan.js');
//    Template.config.set('root', __dirname + 'views');
//    Template.config.set('ext', '.html');
//
//    var _read = Template.read;
//    Template.read = function (name, filePath, _enc) {
//        if (! filePath)
//            filePath = path.join(
//                this.config.get('root')
//              , name + this.config.get('ext')
//            );
//
//        _read.apply(this, arguments);
//    };

    var templateFile = path.join( __dirname, './views/01.html' );
    Template.read('01', templateFile);

    var template = new Template('01');
    var option   = {H1: 'Hogan'};


    t.ok(template);
    t.equal(template.render(option), '<h1>hello Hogan</h1>\n');

    t.end();
});

test('Templateを拡張した my Templateを定義する(requrie "ejs")', function (t) {
    Template.engine('ejs');
    Template.compile = function (template) {
        var render = this._engine.render.bind(this._engine, template);
        return {render: render};
    };


    var templateFile = path.join( __dirname, './views/02.html' );
    Template.read('02', templateFile);

    var template = new Template('02');
    var option   = {H1: 'EJS'};

    t.ok(template);
    t.equal(template.render(option), '<h1>hello EJS</h1>\n');

    t.end();
});
