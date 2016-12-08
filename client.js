'use strict'

const Flow = require('flow');
const cache = {};
const Readable = require('stream').Readable;
const RE_method_path = /^([^\/]+)\/([^#]+)(?:#([^\?]+))?\?(.*)$/;
 
function AStream (array) {

    // source
    let count = -1;
    const source = () => {

        if (!stream.array) {
            stream.pause();
            return;
        }

        if (++count === stream.array.length) {
            stream.push(null);
        } else if (stream.push(stream.array[count])) {
            source();
        }
    };

    const stream = new Readable({
        objectMode: true,
        read: source
    });

    if (array) {
        stream.array = array;
    }

    stream.set = (array) => {
        stream.array = array;
        stream.resume();
        source();
    };

    stream.pause();

    return stream;
};

module.exports = (event, options) => {
    const env = FLOW_ENV;
    const scope = {
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
        seq: (event_iri) => {

            const stream = AStream();

            fetch(env.event + event_iri).then(response => {

                if (!response.ok) {
                    return stream.emit('error', new Error(response.statusText));
                }

                return response.json();

            }).then(triples => stream.set(triples));

            return stream;
        },
        fn: (method_iri, session, callback) => {

            method_iri = method_iri.match(RE_method_path);
            if (!method_iri || !method_iri[1] || !method_iri[2] || !method_iri[4]) {
                return callback(new Error('Flow-nodejs.adapter.fn: Invalid method path.'));
            }

            const node = document.createElement('script');
            const path = method_iri[1] + '/' + method_iri[2] + '.js';
            node.onload = () => {
                node.remove();
                callback(null, require(method_iri[2])[method_iri[4]]);
            };

            node.src = env.module + path;
            document.head.appendChild(node);
        }
    };
    const flow = Flow(env, scope)(event, options);
    flow.on('error', error => console.error(error));
    flow.end({});
    return flow;
};
