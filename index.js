#!/usr/bin/env node

var DEV = process.env.NODE_ENV !== 'production';

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var mkdirp = require('mkdirp');
var browserify = require('browserify');
var uglify = require('uglifyify');
var watchify;
var getModules = require('./lib/getModules');

var argv = require('yargs')
    .demand(1)
    .option('d', {
        alias: 'debug',
        default: false,
        type: 'boolean',
        describe: 'Bundle scripts unminified and with a source map.'
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

if (DEV) {
    try {
        watchify = require('watchify');
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.error('Disabling watchify. Are you running in development?');
            DEV = false;
        } else {
            throw err;
        }
    }
}

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
                return console.log('Done');
            }

            console.log('Flow-pack.bundle:', modules[count]); 
            bundle(modules[count], packages[modules[count]], handler);
        };

        console.log('Flow-pack.bundle:', modules[count]); 
        bundle(modules[count], packages[modules[count]], handler);
    });
});

function bundle (module, pkg, cb) {

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
    b.on('error', console.log.bind(console));

    // watchify
    if (argv.w) {
        if (DEV && watchify) {
            b.on('update', function (file) {
                console.log('Flow-pack.bundle: Rebundle', file[0]);
                b.bundle()
                    .pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION}))
                    .pipe(fs.createWriteStream(bundles_target + '/' + module + '.js'));
            });
            b.plugin(watchify);
        }
    }
    // uglify
    else {
        b.transform({global: true}, uglify);
    }

    // gzip and write bundle
    b.bundle()
        .pipe(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION}))
        .pipe(fs.createWriteStream(bundles_target + '/' + module + '.js'))
        .on('finish', cb);
}
