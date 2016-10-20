'use strict'

const Flow = require('flow');
const cache = {};

module.exports = function (event, options) {
    let flow = Flow({
        cache: {
            get: (key) => {
                return cache[key];
            },
            set: (key, val) => {
                cache[key] = val;
            },
            peek: (key) => {
                return cache[key];
            },
            has: (key) => {
                return !!cache[key];
            },
            del: (key) => {
                delete cache[key];
            }
        },
        read: (name, callback) => {

            // TODO triple stream
            fetch('FLOW_READ_URL' + name).then(response => {

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
            node.src = 'FLOW_MODULE_URL' + path;
            document.head.appendChild(node);
        }
    })(event, options);
    //flow.on('error', error => console.error(error));
    //flow.on('data', error => console.log(error));
    flow.end(1);
    return flow;
};
