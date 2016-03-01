#!/usr/bin/env node

// TODO watchify lib/flow.client.js -vd -o 'gzip -9 > M.js'
// TODO clean up module by separating functionality into files 

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var mkdirp = require('mkdirp');
var browserify = require('browserify');
var factor = require('factor-bundle');
var uglifyify = require('uglifyify');
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
var base_node_modules = base + '/node_modules';
var bundles_target = base + '/' + argv.t;
var bo = {
    debug: argv.d,
    basedir: base,
    require: []
};

// ensure bundle target
mkdirp(bundles_target, function (err) {

    // bundle the individual modules
    getModules(base, function (err, packages) {

        if (err) {
            throw err;
        }

        var outputs = [];
        Object.keys(packages).forEach(function (module) {
            var pkg = packages[module];

            if (pkg.browser && typeof pkg.browser !== 'string') {
                // TODO add all files from the object
                return;
            }

            var file = pkg._flow_custom ? pkg.main : base_node_modules + '/' + module + '/' + (pkg.browser || pkg.main);

            bo.require.push({
                file:  file,
                expose: module
            });

            outputs.push(bundles_target + '/' + module + '.js'); 
        });

        console.log('Flow-pack.bundle:', outputs.length, 'Files.');

        var count = 0;
        var b = browserify(bo);

        // uglify code
        b.transform({global: true}, uglifyify);

        // handle individual packs
        b.on('factor.pipeline', function (file, pipeline) {

            // zip files
            pipeline.get('pack').push(zlib.createGzip());

            // TODO find a better way, to know when all bundles are written.
            pipeline.on('end', function () {
                if (++count === outputs.length) {
                    console.log('Flow-pack.bundle: All files bundled.');
                }
            });
        });

        b.plugin(factor, {outputs: outputs});
        b.on('error', console.log.bind(console));
        b.bundle();
    });
});
