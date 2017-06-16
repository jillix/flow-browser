const cache = {};
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

            if (!response.ok) {
                return Promise.reject(response.statusText);
            }

            return response.json();
        });
    },
    fnc: (fn_iri, role) => {
        // TODO here we could load the handler bundle form the safenetwork
        return new Promise((resolve, reject) => {
            const node = document.createElement("script");
            node.onload = () => {
                node.remove();
                resolve(fn_iri);
            };
            node.src = "/.fn/" + fn_iri;
            document.head.appendChild(node);
        });
    },
    dep: (name, dependency) => {
        return new Promise((resolve, reject) => {
            const node = document.createElement("script");
            node.onload = () => {
                node.remove();
                resolve(name);
            };
            node.src = "/.dp/" + dependency;
            document.head.appendChild(node);
        });
    },
    err: console.error;
});
