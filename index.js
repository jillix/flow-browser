#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var mkdirp = require('mkdirp');
var browserify = require('browserify');
var factor = require('factor-bundle');
var uglify = require('uglifyify');
//var watchify = require('watchify');
var getModules = require('./lib/getModules');
var argv = require('yargs')
    .demand(1)
    .option('d', {
        alias: 'debug',
        default: false,
        type: 'boolean',
        describe: 'Bundle scripts unminified and with a source map.'
    })
    .option('t', {
        alias: 'target',
        default: '.bundles',
        type: 'string',
        describe: 'Ensures the target folder for bundles.'
    })
    .usage('flow-pack [options] [APP_REPO_PATH]')
    .example('flow-pack -d', "Bundle scripts unminified and with a source map.")
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

        var outputs = [];
        var entries = []; 
        Object.keys(packages).forEach(function (module) {
            var pkg = packages[module];

            if (pkg.browser && typeof pkg.browser !== 'string') {
                // TODO add all files from the object
                return;
            }

            var file = pkg._flow_custom ? pkg.main : module;

            entries.push({
                file:  file,
                expose: module
            });

            outputs.push(bundles_target + '/' + module + '.js'); 
        });

        console.log('Flow-pack.bundle:', outputs.length, 'Files..');

        var count = 0;
        var b = browserify({
            cache: {},
            packageCache: {},
            debug: argv.d,
            basedir: base,
            require: entries,
            plugin: [[factor, {outputs: outputs}]/*, watchify*/]
        });

        // TODO make watchify work
        /*b.on('update', function () {
            b.bundle();
        });*/ 

        b.on('error', console.log.bind(console));

        // uglify and zip files
        b.on('factor.pipeline', function (file, pipeline) {
            if (!argv.d) {
                pipeline.push(uglify(file, {sourcemap: false}));
            }

            pipeline.push(zlib.createGzip({level: zlib.Z_BEST_COMPRESSION}));
        });
        b.bundle();
    });
});
