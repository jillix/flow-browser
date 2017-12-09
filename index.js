import Flow from "./flow.js";

export default (sequences, handlers, dependencies) => {
    const cache = {};
    return Flow({
        set: (key, val) => {
            return cache[key] = val;
        },
        get: (key) => {
            return cache[key];
        },
        del: (key) => {
            delete cache[key];
        },
        seq: (sequenceId, role) => {
            return fetch(sequences + "/" + sequenceId + ".json").then((response) => {
                return response.ok ? response.json() : Promise.reject(response.statusText);
            });
        },
        fnc: (fn_iri, role) => {
            return fetch(handlers + "/" + fn_iri + ".js").then((response) => {
                return response.text().then((script) => {
                    return new Function("Adapter", "flow", script);
                });
            });
        },
        dep: (name, dependency) => {
            return new Promise((resolve, reject) => {
            const node = document.createElement("script");
            node.onload = () => {
                node.remove();
                resolve(name);
            };
            node.src = dependencies + "/" + name + ".js";
            node.type = "text/javascript";
            document.head.appendChild(node);
        });
        }
    });
}
