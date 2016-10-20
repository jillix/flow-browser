'use strict'

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const browserify = require('browserify');
const replace = require('browserify-replace');
const babelify = require('babelify');
const uglify = require('uglifyify');
const modules = {};

module.exports = function (target, module, callback) {

    let module_name = module.expose;
    if (modules[module_name]) {

        if (modules[module_name].ready) {
            return callback(null, modules[module_name].bundle);
        }

        return modules[module_name].calls.push(callback); 
    }

    target = path.resolve(target);
    modules[module_name] = {
        require: module,
        calls: [callback],
        bundle: target,
        replace: module.replace
    };

    fs.open(target, 'r', (err, fd) => {

        if (err && err.code === "ENOENT") {
            return createBundle(modules[module_name]);
        }

        cb_buffer(modules[module_name], err);
    }); 
};

function createBundle (module) {

    let b = browserify({
        cache: {},
        packageCache: {},
        basedir: path.resolve('node_modules'),
        require: module.require
    });
    b.on('error', error => cb_buffer(module, error));

    if (module.replace) {
        b.transform(replace, {replace: module.replace});
    }

    b.transform(babelify, {presets: ['es2015'], global: true});
    b.transform(uglify, {global: true});

    let writeStream = fs.createWriteStream(module.bundle);
    writeStream.on('close', () => cb_buffer(module));
    b.bundle().pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION})).pipe(writeStream);
};

function cb_buffer (module, error) {
    module.calls.forEach(cb => {
        cb(error, module.bundle);
    });
    module.ready = true;
    delete module.calls;
}
