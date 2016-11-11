'use strict'

const fs = require('fs');
const exec = require('child_process').exec;
const bundler = require('./lib/browserify');
const module_name = 'flow-browser';
const replace_from = /FLOW_ENV/;

exports.client = function (scope, inst, args, data, next) {

    const replace_to = scope.env.browser ? JSON.stringify(scope.env.browser) : '{}';

    bundler(args.target, {
        file: module_name,
        expose: module_name,
        replace: [{from: replace_from, to: replace_to}]
    }, (err, module) => {
        data.file = module;
        next(err, data);
    });
};

exports.bundle = function (scope, inst, args, data, next) {

    const module_name = data.module.slice(0, -3);
    const file_path = args.target + '/' + module_name + '.js';
    const repo = data.owner + '/' + module_name;
    const done  = (err, module) => {
        data.file = file_path;
        next(err, data); 
    };

    fs.access(process.cwd() + '/node_modules/' + module_name, (err) => {

        if (err) {
             return exec('npm i --prefix ' + process.cwd() + ' ' + repo, err => {

                if (err) {
                    return next(err);
                }

                bundle(file_path, module_name, done);
            });
        }

        bundle(file_path, module_name, done);
    });
}; 

function bundle (file_path, module_name, done) {
    bundler(file_path, {
        file: module_name,
        expose: module_name
    }, done);
}
