import Safe from "./safe.js";
import Flow from "./flow.js";

export default (app_config, initSequence) => {

    return Safe(app_config)
    .then((app) => {
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
            seq: (addr) => {
                return app.idata.read(addr).then((data) => {
                    console.log(data.toString())
                    return JSON.parse(data.toString());
                });
            },
            fnc: (addr) => {
                return app.idata.read(addr).then((data) => {
                    console.log(data.toString());
                    return new Function("Adapter", "flow", data.toString());
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
        })(initSequence);
    });
}
