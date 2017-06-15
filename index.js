const cache = {};
Flow({
    get: (id) => {
        return cache[id];
    },
    set: (id, data) => {
        return cache[id] = data;
    },
    del: (id) => {
        delete cache[id];
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
                resolve();
            };
            node.src = "/.fn/" + fn_iri;
            document.head.appendChild(node);
        });
    },
    dep: (dependency) => {
        return new Promise((resolve, reject) => {
            const node = document.createElement("script");
            node.onload = () => {
                node.remove();
                resolve();
            };
            node.src = "/.dp/" + dependency;
            document.head.appendChild(node);
        });
    },
    err: console.error;
});
