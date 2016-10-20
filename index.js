'use strict'

const bundler = require('./lib/browserify');
const module_name = 'flow-browser';

exports.client = function (args, data, next) {

    // TODO merge entrypoint config with client adapter
    bundler(args.target, {
        file: module_name,
        exposemodule_nameme
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
