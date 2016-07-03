import { mix } from '..'

// This is the mixin
const square = {
    width: '50px',
    height: '50px',
}

const condition = false

export default {
    '.class1': mix(
        square,
        {
            backgroundColor: 'red',
        }
    ),

    '.class2': mix(
        square & condition,  
        {
            position: 'float',
            padding: '1px 1px 3px 10px',
        }
    )
}
