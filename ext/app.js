#!/usr/bin/env node
"use strict";

var path  = require('path');
var carom = require(path.join( __dirname, '../'));

var app = carom.app;
var root = app.config.get('root');
var statics = ('/js /css /doc /image /mp3').split(' ');

var Template = carom.Template;
Template.engine('hogan.js')
Template.read('index', path.join( __dirname, 'views/index.html'));

app.config.set('port', 3030);
app.config.set('accesslog', path.join( __dirname, 'accesslog'));
app.config.set('errorlog',  path.join( __dirname, 'errorlog'));

app.use('favicon')
.use('accesslog', app.config.get('accesslog'))
.use('errorlog',  app.config.get('errorlog'))
.use('static', {root: path.join( root, 'public'), statics: statics})
.use('router', app)
.use('404');

app.router.GET('/', function (req, res) {
    var template = new Template('index');
    this.html(template.render({
        TITLE: 'MP3'
      , LINK_TITLE: 'miyagawa-podcast-ep8'
      , LINK_HREF:  '/mp3/podcast-ep8.mp3'
    }));
});

app.server.listen(app.config.get('port'), function () {
    console.log('Server start to listen on port "%s"', app.config.get('port'));
});
