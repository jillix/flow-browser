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

var argv = require('yargs').option('d', {
        alias: 'debug',
        default: false,
        type: 'boolean',
        describe: 'Bundle scripts unminified and with a source map.'
    })
    .example('flow-app bundle -d', "Bundle scripts unminified and with a source map.")
    .help('h')
    .alias('h', 'help')
    .strict()
    .argv;

console.log(argv);

var base = path.resolve(argv._[0] || '../../');
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

                    if (config.module[0] === '/') {
                        bundles[config.module] = true;  
                    } else {
                        bundles[config.module] = false;
                    }
                }
            });

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

        var b = browserify({debug: false});
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

        var dev;
        if (dev) {
            // .. create source maps
            // .. don't compile
            // .. zip, yes
        }

        console.log('Bundle file:', bundle);
        b.bundle().pipe(fs.createWriteStream(bundle));
        ClosureCompiler.compile(bundle, {}, compressBundle(bundle)); 
    }
});

function compressBundle (bundle) {
    return function (err, result) {
        if (err) {
            console.log('ENGINE BUNDLE ERR:', err);
        }

        if (result) {
            console.log('ENGINE BUNDLED:', bundle);
            fs.writeFileSync(bundle, zlib.gzipSync(result, {level: zlib.Z_BEST_COMPRESSION}));
        }
    }
}
