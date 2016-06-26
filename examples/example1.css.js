const blue = '#00F'

export default {
    '.class1': {
        minWidth: '40px',
        zIndex: 10,

        '.class2': {
            minHeight: '300px',
            color: blue,
        },

        '@media screen and (max-width: 1000px)': {
            paddingLeft: '20px',
        }
    },

    '.class3': {
        backgroundColor: blue,
    },
}
