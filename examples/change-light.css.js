import { changeLight } from '../tools'

const color = '#aabbcc'

export default {
    '.dark': {
        backgroundColor: changeLight(color, 0.5)
    },

    '.bright': {
        backgroundColor: changeLight(color, 1.5)
    }
}

