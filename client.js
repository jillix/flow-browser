'use strict'

const Flow = require('flow');

module.exports = function (event, options) {
    let flow = Flow({
        cache: {},
        read: (name, callback) => {

            // TODO triple stream
            fetch('/_i/' + name + '.json').then(response => {

                if (!response.ok) {
                    return callback(new Error(response.statusText));
                }

                return response.json();

            }).then(composition => callback(null, composition));
        },
        mod: (name, callback) => {
            var node = document.createElement('script');
            var path = name + '.js';
            node.onload = () => {
                node.remove();
                callback(null, require(name));
            };

            // set url and append dom script elm to the document head
            node.src = '/_m/' + path;
            document.head.appendChild(node);
        }
    })(event, options);
    //flow.on('error', error => console.error(error));
    //flow.on('data', error => console.log(error));
    flow.end(1);
    return flow;
};
