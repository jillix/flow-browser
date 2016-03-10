#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var mkdirp = require('mkdirp');
var babelify = require('babelify');
var browserify = require('browserify');
var uglify = require('uglifyify');
var watchify = require('watchify');
var getModules = require('./lib/getModules');

var argv = require('yargs')
    .demand(1)
    .option('d', {
        alias: 'debug',
        default: false,
        type: 'boolean',
        describe: 'Bundle scripts unminified and with a source map.'
    })
    .option('q', {
        alias: 'quiet',
        default: false,
        type: 'boolean',
        describe: 'Do not print log information.'
    })
    .option('w', {
        alias: 'watch',
        default: false,
        type: 'boolean',
        describe: 'Rebundle on file change.'
    })
    .option('t', {
        alias: 'target',
        default: '.bundles',
        type: 'string',
        describe: 'Ensures the target folder for bundles.'
    })
    .usage('flow-pack [options] [APP_REPO_PATH]')
    .example('flow-pack -d', "Bundle scripts unminified and with a source map.")
    .example('flow-pack -w', "Rebundle on file change.")
    .example('flow-pack -t .bundles', "Ensures the target folder for bundles.")
    .help('h')
    .alias('h', 'help')
    .strict()
    .argv;

var base = path.resolve(argv._[0]);
var bundles_target = base + '/' + argv.t; 

// ensure bundle target
mkdirp(bundles_target, function (err) {

    // bundle the individual modules
    getModules(base, function (err, packages) {

        if (err) {
            throw err;
        }

        var count = 0;
        var modules = Object.keys(packages);
        var handler = function () {
            if (++count === modules.length) {
                return;
            }

            bundle(modules[count], packages[modules[count]], handler);
        };

        bundle(modules[count], packages[modules[count]], handler);
    });
});

function bundle (module, pkg, callback) {

    // browserify
    var b = browserify({
        cache: {},
        packageCache: {},
        debug: argv.d,
        basedir: base,
        require: {
            file: pkg._flow_custom ? pkg.main : module,
            expose: module
        }
    });

    // the actual file writer function
    function bundlePipe (onFinish) {
        var stream = b.bundle()
            .pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION}))
            .pipe(fs.createWriteStream(bundles_target + '/' + module + '.js'));
        if (typeof onFinish === 'function') {
            stream.on('finish', onFinish);
        }
    }

    // log errors
    b.on('error', console.error.bind(console));

    // babelify
    b.transform(babelify, {presets: ['es2015'], global: true});

    // uglify
    if (!argv.d) {
        b.transform(uglify, {global: true});
    }

    // watchify
    if (argv.w) {
        if (!argv.q) {
            console.log('Flow-pack.watch:', module);
        }
        b.on('update', function (file) {
            if (!argv.q) {
                console.log('Flow-pack.bundle:', file[0]);
            }
            bundlePipe();
        });
        b.plugin(watchify);
        bundlePipe();
        return callback();
    }

    // gzip and write bundle
    if (!argv.q) {
        console.log('Flow-pack.bundle:', module);
    }
    bundlePipe(callback);
}
