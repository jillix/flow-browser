'use strict'

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('uglifyify');

// TODO set up bundler stream with data handlers

exports.bundle = function (args, data, next) {
    next(null, browserify(
        path.resolve(data.file || args.file),
        {
            cache: {},
            packageCache: {},
            basedir: path.resolve(data.base || args.base),
            externalRequireName: data.module || args.module
        }
    ).bundle());
}

exports.babel = function (args, stream, next) {
    next(null, stream.pipe(babelify({presets: ['es2015'], global: true})));
};

exports.compile = function (args, stream, next) {
    next(null, stream.pipe(uglify({global: true})));
};

exports.compress = function (args, stream, next) {
    next(null, stream.pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION})));
};

exports.writeFile = function (args, stream, next) {
    next(null, stream.pipe(fs.createWriteStream(base + '/' + module + '.js')));
};
