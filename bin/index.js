#!/usr/bin/env node

// TODO move app installation to service-api
// debugging
//  - recompile individual modules!!!!!!!! it's time for http2!!!!
//      * how would the module prop in the composition look like? [bundleA, bundleB]?
//  - watchify lib/flow.client.js -vd -o 'gzip -9 > M.js'
// TODO what about html/css/text compression on install?

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var browserify = require('browserify');
var ClosureCompiler = require('closurecompiler');

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

var flowApi = {
    getInstances: function (app, callback) {

        // TODO check if path "app" exists

        fs.readdir(app + '/composition', function (err, configs) {

            if (err) {
                return callback(err);
            }

            // get all file paths to bundle
            var bundles = {};
            configs.forEach(function (config) {
                config = require(app + '/composition/' + config);

                /*
                    module: "module",
                    module: "/module/file.js:/module/bundle.js"
                    browser: "module/file.js"
                */

                if (!config.server && config.module) {
                    config.module = config.browser || config.module;
                    bundles[config.module] = config.module[0] === '/' ? true : false;  
                }
            });

            // include bundles from cli include option
            if (argv.i) {
                argv.i.forEach(function (key) {
                    bundles[key] = key[0] === '/' ? true : false;  
                });
            }

            callback(null, bundles);
        });
    }
};

// bundle the individual modules
flowApi.getInstances(base, function (err, bundles) {

    if (err) {
        throw err;
    }

    for (var bundle in bundles) {

        var b = browserify({debug: argv.d});
        var requirePath = bundle;

        if (bundles[bundle]) {
            requirePath = requirePath.split('/');
            requirePath.pop();
            requirePath = requirePath.join('/') + '/bundle.js';
            b.require(base_app_modules + bundle, {expose: requirePath});
            bundle = base_app_modules + requirePath;
        } else {
            b.require(bundle);
            bundle = base_node_modules + '/' + bundle + '/bundle.js';
        }

        var file = fs.createWriteStream(bundle);
        if (argv.d) {
            var gzip = zlib.createGzip({level: zlib.Z_BEST_COMPRESSION});
            b.bundle().pipe(gzip).pipe(file);
        } else {
            b.bundle().pipe(fs.createWriteStream(bundle));
            ClosureCompiler.compile(bundle, {}, compressBundle(bundle)); 
        }
    }
});

function compressBundle (bundle) {
    return function (err, result) {
        if (err) {
            console.log('FlowPack: Error:', err);
        }

        if (result) {
            console.log('FlowPack: File bundled:', bundle);
            fs.writeFileSync(bundle, zlib.gzipSync(result, {level: zlib.Z_BEST_COMPRESSION}));
        }
    }
}
