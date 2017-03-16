'use strict'

const Flow = require('flow');
const LRU = require("lru-cache");
const modules = {};

function requireFn (name, callback) {
    let fn = require(name);

    if (typeof fn !== 'function') {
        return callback(new Error('Flow-browser.fn: "' + exports + '" in module "' + module + '" is not a function.'));
    }

    callback(null, fn);
}

// Browser flow adapter
//
// args example =>
//
// sequenceId = 'someSequenceName'
// env = {
//     sequence: '/sequence/',
//     fn: '/fn/'
// }
// options = {
//
// };
module.exports = (sequenceId, env, options) => {

    if (!sequenceId) {
        return console.error('Start sequence missing. Example: flow sequenceId');
    }

    const event = Flow({
        cache: LRU({max: 500}),
        seq: (sequenceId, role, callback) => {
            fetch(env.sequence + sequenceId).then(response => {

                if (!response.ok) {
                    return callback(response.statusText);
                }

                return response.json();

            }).then(sequence => callback(null, sequence)).catch(callback);
        },
        fn: (fn, role, callback) => {

            const node = document.createElement('script');
            node.onload = () => {
                modules[fn] = 1;
                node.remove();
                requireFn(fn, callback);
            };

            node.src = env.fn + fn;
            document.head.appendChild(node);
        }
    })({
        sequence: sequenceId
    });

    event.on('error', error => {
        console.error(error);
    });
};
