/**
 * Given any number of objects, it merges/mixes all of them into a new object.
 * Since it is a shallow mixing, nested objects will not be copied, just
 * reference.
 *
 * Falsy values will be ignored, this way it is easy to do conditional 
 * mixing, for instance:
 *
 * mix(obj1, obj2, boolValue & obj3)
 * 
 */
export function mix(...objs) {
    return Object.assign({}, ...objs.filter(Boolean))
}


/**
 * Given a colour in hex form '#aabbcc', it returns it multiplied by the factor.
 * Numbers greater than 1 will lighten the input, and smaller than one will darken it.
 * If values go smaller than 0 or greater than 255, they will be capped.
 *
 * Short forms like '#ccc' are also accepted, but returned expanded.
 */
export function changeLight(col, factor) {

    col = col.substring(1)
  
    if (col.length === 3) {
        col = col.split('').map(x => x + x).join('')
    }

    return '#' + col.match(/\w{2}/g)
        .map(x => parseInt(x, 16))
        .map(x => x * factor)
        .map(Math.round)
        .map(x => Math.min(x, 255))
        .map(x => Math.max(x, 0))
        .map(x => x.toString(16))
        .map(x => ('00' + x).slice(-2))
        .join('')
}

export const prefixes = ['webkit', 'moz', 'ms', 'o']

/**
 * Given a property, a value and an optional array of prefixes,
 * returns an object with the different prefixed properties as keys,
 * and the passed value for each key. 
 */
export function prefix(prop, value, prefs = prefixes) {
    const res = { [prop]: value }
    let atRule = false

    if (prop.startsWith('@')) {
        atRule = true
        prop = prop.substring(1)
    }

    for (let pref of prefs) {
        // Since this function can be used for properties but also for
        // selectors/at-rule keywords, we can't use the camelCase convetion
        // for it may change HTML class selectors that can have upper case
        // letters
        let key = (atRule ? '@' : '') + '-' + pref + '-' + prop
        res[key] = value
    }

    return res
}


/**
 * Given a property and an array of values, it returns an object
 * that will be rendered as if the property was defined for each value.
 *
 * For instance:
 *
 * multivalue('display', ['-ms-flexbox', '-webkit-flex', 'flex'])
 *
 * Will be rendered as:
 *
 * display: -ms-flexbox;
 * display: -webkit-flex;
 * display: flex;
 *
 */
export function multivalue(prop, values) {
    const res = {}

    values.forEach((val, idx) => {
        res[prop + '/*' + idx + '*/'] = val
    })

    return res
}


