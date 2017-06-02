'use strict'

const Flow = require('flow');
const LRU = require("lru-cache");
const modules = {};

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
        seq: (sequenceId, role) => {
            return fetch(env.sequence + sequenceId).then(response => {

                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }

                return response.json();
            });
        },
        fn: (fn, role) => {
            return new Promsise((resolve, reject) => {
                const node = document.createElement('script');
                node.onload = () => {
                    modules[fn] = 1;
                    node.remove();
                    let fn = require(name);
                    if (typeof fn !== 'function') {
                        return reject(new Error('Flow-browser.fn: "' + exports + '" in module "' + module + '" is not a function.'));
                    }
                    resolve(fn);
                };

                node.src = env.fn + fn;
                document.head.appendChild(node);
            });
        }
    })({
        sequence: sequenceId
    });

    event.on('error', error => {
        console.error(error);
    });
};
