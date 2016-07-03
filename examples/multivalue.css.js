import { multivalue } from '../tools'

export default {
    '.my-flex-box': multivalue('display', ['-ms-flexbox', '-webkit-flex', 'flex']),
}
