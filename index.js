const cache = {};
function loadScript (name, src) {
    return new Promise((resolve, reject) => {
        const node = document.createElement("script");
        node.onload = () => {
            node.remove();
            resolve(result);
        };
        node.src = src;
        document.head.appendChild(node);
    });
}
Flow({
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
        // TODO here we could load a sequence from the safenetwork
        return fetch("/.sq/" + sequenceId).then((response) => {
            return response.ok ? response.json() : Promise.reject(response.statusText);
        });
    },
    fnc: (fn_iri, role) => {
        // TODO here we could load the handler script form the safenetwork
        loadScript(fn_iri, "/.fn/" + fn_iri);
    },
    dep: (name, dependency) => {
        loadScript(name, "/.dp/" + dependency);
    }
});
