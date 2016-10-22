'use strict'

const Flow = require('flow');
const cache = {};
const Readable = require('stream').Readable;

function AStream (array) {

    // source
    let count = -1;
    let source = () => {

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

    let stream = new Readable({
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
        read: (event_iri) => {

            const stream = AStream();

            fetch('FLOW_READ_URL' + event_iri).then(response => {

                if (!response.ok) {
                    return stream.emit('error', new Error(response.statusText));
                }

                return response.json();

            }).then(triples => stream.set(triples));

            return stream;
        },
        mod: (name, session, callback) => {
            var node = document.createElement('script');
            var path = name + '.js';
            node.onload = () => {
                node.remove();
                callback(null, require(name.split('/').pop()));
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
