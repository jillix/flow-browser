"use strict"

const Flow = require("flow");
const cache = {};

module.exports = (sequenceId, env) => {

    if (!sequenceId) {
        return console.error("Start sequence missing. Example: flow sequenceId");
    }

    const event = Flow({
        cache: {
            get: (id) => {
                return cache[id];
            },
            set: (id, data) => {
                return cache[id] = data;
            },
            del: (id) => {
                delete cache[id];
            }
        },
        seq: (sequenceId, role) => {
            // TODO here we could load a sequence from the safenetwork
            return fetch(env.sequence + sequenceId).then(response => {

                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }

                return response.json();
            });
        },
        fn: (fn_iri, role) => {
            return new Promise((resolve, reject) => {
                const node = document.createElement("script");
                node.onload = () => {
                    cache[fn_iri] = 1;
                    node.remove();
                    fn_iri = require(fn_iri);
                    if (typeof fn_iri !== "function") {
                        delete cache[fn_iri];
                        return reject(new Error("Flow-browser.fn: \"" + exports + "\" in module \"" + module + "\" is not a function."));
                    }
                    resolve(fn_iri);
                };

                node.src = env.fn + fn_iri;
                document.head.appendChild(node);
            });
        }
    })({
        sequence: sequenceId
    });

    event.on("error", error => {
        console.error(error);
    });
};
