var fs = require('fs');

// get all module packages, which are required on the client
module.exports = function (app, callback) {

    fs.readdir(app + '/composition', function (err, configs) {

        if (err) {
            return callback(err);
        }

        // get all file paths to bundle
        var packages = {};
        configs.forEach(function (config) {


            // ignore non json files
            if (config.split('.').pop() !== 'json') {
                return;
            }

            // ignore invalid composition
            try {
                config = require(app + '/composition/' + config);
            } catch (e) {
                return;
            }

            // ignore server only compositions
            if (config.server) {
                return;
            }

            // collect unique module packages
            if (config.module.charAt(0) === '/') {
                packages[config.name] = {
                    _flow_custom: true,
                    main: app + '/app_modules' + config.module
                };
            } else if (!packages[config.module]) {
                // TODO how use require.resolve() outside the module folder?;
                // console.log('resolved path:', require.resolve(config.module));
                packages[config.module] = require(app + '/node_modules/' + config.module + '/package.json');
            }
        });

        callback(null, packages);
    });
};
