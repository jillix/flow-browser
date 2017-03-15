'use strict'

const fs = require('fs');
const bundler = require('./lib/browserify');
const module_name = 'flow-browser';
const replace_from = /FLOW_ENV/;

exports.client = (scope, inst, args, data, next) => {

    fs.access(args.target, err => {

        if (!err) {
            data.file = args.target;
            return next(null, data);
        }

        const replace_to = scope.env.browser ? JSON.stringify(scope.env.browser) : '{}';
        const replace_start = '';

        bundler(scope.env.production, args.target, {
            file: module_name,
            expose: module_name,
            replace: [{from: replace_from, to: replace_to}]
        }, (err, module) => {
            data.file = module;
            next(err, data);
        });
    });
};