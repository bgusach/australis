const mix = require('../tools').mix

const square = {
    width: '50px',
    height: '50px',
}

const bordered = {
    borderStyle: 'solid',
    borderWidth: '3px',
    borderColor: 'blue',
}


exports.default = {
    '.class1': mix(square, bordered, {
        backgroundColor: 'red',
    }),

    '.class2': mix(square, {
        position: 'float',
        padding: '1px 1px 3px 10px',
    })
}
