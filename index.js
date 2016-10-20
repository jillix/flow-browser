'use strict'

const bundler = require('./lib/browserify');
const module_name = 'flow-browser';
const replace_read = /FLOW_READ_URL/;
const replace_module = /FLOW_MODULE_URL/;

exports.client = function (args, data, next) {

    bundler(args.target, {
        file: module_name,
        expose: module_name,
        replace: [
            {from: replace_read, to: process.flow_env.browser.read},
            {from: replace_module, to: process.flow_env.browser.mod}
        ]
    }, (err, module) => {
        data.file = module;
        next(err, data);
    });
};

exports.bundle = function (args, data, next) {
    bundler(args.target, {
        file: data.module,
        expose: data.module
    }, (err, module) => {
        data.file = module;
        next(err, data);
    });
}; 
