'use strict'

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('uglifyify');

// TODO set up bundler stream with data handlers
module.exports = function (module, callback) {
/*
    let b = browserify(
        path.resolve(data.file || args.file),
        {
            cache: {},
            packageCache: {},
            basedir: path.resolve(data.base || args.base),
            externalRequireName: data.module || args.module
        }
    ).bundle()
    b.babelify({presets: ['es2015'], global: true});
    next(null, stream.pipe(uglify({global: true})));
    next(null, stream.pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION})));
    next(null, stream.pipe(fs.createWriteStream(base + '/' + module + '.js')));
*/
    callback(null, 'console.log("Module: '+ module +'");');
};
