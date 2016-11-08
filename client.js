'use strict'

const Flow = require('flow');
const cache = {};
const Readable = require('stream').Readable;
 
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
        read: (event_iri) => {

            const stream = AStream();

            fetch(env.event + event_iri).then(response => {

                if (!response.ok) {
                    return stream.emit('error', new Error(response.statusText));
                }

                return response.json();

            }).then(triples => stream.set(triples));

            return stream;
        },
        mod: (name, session, callback) => {
            const node = document.createElement('script');
            const path = name + '.js';
            node.onload = () => {
                node.remove();
                callback(null, require(name.split('/').pop()));
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
