import { multivalue, prefix } from '../tools'

export default {
    '.class1': multivalue('display', ['-ms-flexbox', '-webkit-flex', 'flex']),

    '.class2': prefix('animation', 'slide'),
}
