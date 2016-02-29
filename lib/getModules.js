var fs = require('fs');

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

            if (config.module.charAt(0) === '/') {
                packages[config.name] = {
                    _flow_custom: true,
                    main: app + '/app_modules' + config.module
                };
                return;
            }

            // collect module packages
            packages[config.module] = require(app + '/node_modules/' + config.module + '/package.json');
        });

        callback(null, packages);
    });
};
