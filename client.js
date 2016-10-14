import Flow from 'flow';

export default (event, options) => {
    let flow = Flow({
        cache: {},
        read: (name, callback) => {

            // TODO triple stream
            fetch('/_i/' + name + '.json').then(function(response) {

                if (!response.ok) {
                    return callback(new Error(response.statusText));
                }

                return response.json();

            }).then(function (composition) {
                callback(null, composition);
            });
        },
        mod: (name, callback) => {
            var node = document.createElement('script');
            var path = name + '.js';
            node.onload = function () {
                node.remove();
                callback(null, require(name));
            };

            // set url and append dom script elm to the document head
            node.src = '/_m/' + path;
            document.head.appendChild(node);
        }
    })(event, options);
    flow.on('error', error => console.error(error));
    flow.on('data', error => console.data(error));
    flow.end(1);
    return flow;
}
