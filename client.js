var Flow = require('flow');
var adapterSet;

// load module instance composition (MIC)
function mic (name, callback) {

    fetch('/_i/' + name + '.json').then(function(response) {

        if (!response.ok) {
            return callback(new Error(response.statusText));
        }

        return response.json();

    }).then(function (composition) {
        callback(null, composition);
    });
}

// load module
function mod (name, callback) {

    var node = document.createElement('script');
    var path = name + '.js';
    node.onload = function () {
        node.remove();
        callback(null, require(name));
    };

    // set url and append dom script elm to the document head
    node.src = '/_m/' + path;
    document.head.appendChild(node);
};

module.exports = function (event, options) {

    if (!adapterSet) {
        options = options || {};
        options.mod = mod;
        options.mic = mic;
        adapterSet = true;
    }

    return Flow(event, options);
};
