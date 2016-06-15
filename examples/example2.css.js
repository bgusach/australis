const tools = require('sierra').tools

exports.default = {
    '.class1': tools.multivalue('display', ['-ms-flexbox', '-webkit-flex', 'flex']),

    '.class2': tools.prefix('animation', 'slide'),
}
