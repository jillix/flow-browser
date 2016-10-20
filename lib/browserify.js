'use strict'

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('uglifyify');
const modules = {};

module.exports = function (module, target, callback) {

    if (modules[module]) {

        if (modules[module].ready) {
            return callback(null, modules[module].bundle);
        }

        return modules[module].calls.push(callback);
    }

    modules[module] = {
        calls: [],
        bundle: target
    };

    target = path.resolve(target);
    let b = browserify({
        cache: {},
        packageCache: {},
        basedir: path.resolve('node_modules'),
        require: {
            file: module,
            expose: module
        }
    });
    b.on('error', error => cb_buffer(modules[module], error));
    b.transform(babelify, {presets: ['es2015'], global: true});
    b.transform(uglify, {global: true});

    let writeStream = fs.createWriteStream(target);
    writeStream.on('close', () => cb_buffer(modules[module]));
    b.bundle().pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION})).pipe(writeStream);
};

function cb_buffer (module, error) {
    module.calls.forEach(cb => {
        cb(error, module.bundle);
    });
    module.ready = true;
    delete module.calls;
}
