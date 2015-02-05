var falafel = require('falafel');
var esprima = require('esprima');
var jstransform = require('jstransform');
var less = require('less');

var tools = {
    isCreateClassCall: function (node) {
        return (
            node.type === 'CallExpression' &&
            node.callee.type === 'MemberExpression' &&
            node.callee.property.name === 'createClass' &&
            node.arguments[0].type === 'ObjectExpression'
        );
    },
    isCreateElementCall: function (node) {
        return (
            node.type === 'CallExpression' &&
            node.callee.type === 'MemberExpression' &&
            node.callee.property.name === 'createElement' &&
            node.arguments[0].type === 'Identifier'
        );
    }
};

var transform = function (source) {
    var visitors = [];
    [
      require('jstransform/visitors/es6-arrow-function-visitors'),
      require('jstransform/visitors/es6-class-visitors'),
      require('jstransform/visitors/es6-object-short-notation-visitors'),
      require('jstransform/visitors/es6-rest-param-visitors'),
      require('jstransform/visitors/es6-template-visitors')
    ].forEach(function(visitor) {
      visitors = visitors.concat(visitor.visitorList);
    });

    var transformed = jstransform.transform(visitors, source);

    var output = falafel(transformed.code, function (node) {
        if (tools.isCreateClassCall(node)) {
            if (node.arguments) {
                node.arguments.forEach(function(argument) {
                    if (argument.type === 'ObjectExpression') {
                        if (argument.properties) {
                            argument.properties.forEach(function(property) {
                                if (property.type === 'Property'
                                    && property.key.type === 'Identifier'
                                    && property.key.name === 'styles') {

                                    var parser = less.Parser();

                                    try {
                                        parser.parse(property.value.value, function(err, tree) {
                                            if (err) {
                                                console.error(err);
                                            }

                                            argument.properties[1].update('styles: ' + JSON.stringify(tree));
                                        });
                                    }
                                    catch (err) {
                                        console.error(err);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });

    return output.toString();
};

module.exports = transform;