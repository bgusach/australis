// Value definition
const blue = '#00F'

export default {
    '.class1': {
        minWidth: '40px',

        zIndex: 10,

        // Nested selector
        '.class2': {
            minHeight: '300px',
            color: blue,
        },

        // Nested media query
        '@media screen': {
            paddingTop: '10px',

            // Deeper nesting of media query
            '@media (max-width: 1000px)': {
                paddingLeft: '20px',
            }
        }
    },

    '.class3': {
        backgroundColor: blue,
    },
}
