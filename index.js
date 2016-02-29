#!/usr/bin/env node

// TODO watchify lib/flow.client.js -vd -o 'gzip -9 > M.js'

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var mkdirp = require('mkdirp');
var browserify = require('browserify');
var factor = require('factor-bundle');
var ClosureCompiler = require('closurecompiler');
var getModules = require('./lib/getModules');
var argv = require('yargs')
    .demand(1)
    .option('d', {
        alias: 'debug',
        default: false,
        type: 'boolean',
        describe: 'Bundle scripts unminified and with a source map.'
    })
    .option('i', {
        alias: 'include',
        type: 'array',
        describe: 'Bundle a specific modules or files.'
    })
    .usage('flow-pack [options] [APP_REPO_PATH]')
    .example('flow-pack -d', "Bundle scripts unminified and with a source map.")
    .example('flow-pack -i module file.js', "Bundle specific modules or file.") 
    .help('h')
    .alias('h', 'help')
    .strict()
    .argv;
var base = path.resolve(argv._[0]);
var base_app_modules = base + '/app_modules';
var base_node_modules = base + '/node_modules';
var bundles_target = base + '/.bundles';
var bo = {
    debug: argv.d,
    basedir: base,
    require: []
};

// TODO ensure bundle target
//mkdirp(bundles_target, function () {});

// include bundles from cli include option
/*if (argv.i) {
    argv.i.forEach(function (key) {
        bundles[key] = key[0] === '/' ? true : false;
    });
}*/

// bundle the individual modules
getModules(base, function (err, packages) {

    if (err) {
        throw err;
    }

    var outputs = [];
    Object.keys(packages).forEach(function (module) {
        var pkg = packages[module];
        var file = pkg._flow_custom ? pkg.main : base_node_modules + '/' + module + '/' + (pkg.browser || pkg.main);

        // TODO check if pkg.browser is a string, otherwise add all files from the object?

        bo.require.push({
            file:  file,
            expose: module
        });

        outputs.push(bundles_target + '/' + module + '.js'); 

    });

    console.log('Flow-pack.bundle:', outputs.length, 'Files.');

    var count = 0;
    var b = browserify(bo);
    b.plugin(factor, {outputs: outputs});

    // TODO find a better way, to know when all bundles are written.
    b.on('factor.pipeline', function (file, pipeline) {
        pipeline.on('end', function () {
            if (++count === outputs.length) {

                console.log('Flow-pack.compile:', files.length, 'Files.');

                // compile and compress js files
                closureCompile(outputs, argv.d, function () {
                    console.log('Flow-pack.bundle: All files bundled.');
                });
            }
        });
    });
    b.on('error', console.log.bind(console));
    b.bundle();
});

function closureCompile (files, isDebug, callback) {

    var count = 0;
    var callback_handler = function (file) {
        return function (err, bundle) {

            if (err) {
                console.log(err);
            }

            fs.writeFileSync(file, zlib.gzipSync(bundle, {level: zlib.Z_BEST_COMPRESSION}));

            if (++count === files.length) {
                callback();
            }
        };
    };

    files.forEach(function (file) {

        // for non-debug builds, compile the code
        if (isDebug) {
            return callback_handler(file)(null, fs.readFileSync(file));
        }

        ClosureCompiler.compile(file, {language_out: 'ES5'}, callback_handler(file));
    });
}
