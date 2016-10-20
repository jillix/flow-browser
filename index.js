'use strict'

const bundler = require('./lib/browserify');
const modules = {};

exports.client = function (args, data, next) {
    // TODO merge entrypoint config with client adapter
    bundler('flow-browser', args.target, (err, module) => {
        data.file = module;
        next(null, data);
    });
};

exports.bundle = function (args, data, next) {

    if (modules[data.module]) {
        data.file = modules[data.module];
        return next(null, data);
    }

    bundler(data.module, (err, file) => {

        if (err) {
            return next(err);
        }

        data.file = file;
        next(null, data);
    });
}; 
