var path  = require('path');
var fs    = require('fs');

function Template (name) {
    this.template = Template.templates[name];
}
Template.config = {_configs: {}};
Template.templates = {};
Template.engine = function (_engine) {
    if (typeof _engine === 'string') _engine = require(_engine);
    if (_engine) this._engine = _engine;

    return this._engine;
}

Template.extend = function (method, fn) {
    Template.prototype[method] = function () {
        return fn.apply(this, arguments);
    };
};

Template.extend('render', function (option) {
    return this.template.render(option);
});

Template.compile = function (template) {
    return Template._engine.compile(template);
};
Template.read = function (name, filePath, _enc) {
    this.templates[name] = this.compile(fs.readFileSync(filePath, _enc || 'utf-8'));
};

Template.config.get = function (key) { return this._configs[key]; };
Template.config.set = function (key, val) {
    this._configs[key] = val;
    return this;
};

module.exports = Template;
Template.Template = Template;
