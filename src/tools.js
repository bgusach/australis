
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
function mix(...objs) {
    return Object.assign({}, ...objs.filter(Boolean))
}


/**
 * Given a colour in hex form '#aabbcc', it returns it multiplied by the factor.
 * Numbers greater than 1 will lighten the input, and smaller than one will darken it.
 * If values go smaller than 0 or greater than 255, they will be capped.
 *
 * Short forms like '#ccc' are also accepted, but returned expanded.
 */
function changeLight(col, factor) {

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


/**
 * Given a property, a value and an optional array of prefixes,
 * returns an object with the different prefixed properties as keys,
 * and the passed value for each key. 
 *
 * For consistency, keys follow the camelCase convention instead of 
 * dashes
 */
function prefix(prop, value, prefixes = ['webkit', 'moz', 'ms', 'o']) {
    const res = {}

    for (let pref of prefixes) {
        res[capitalize(pref) + capitalize(prop)] = value
    }

    return res
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = { mix, changeLight, prefix }
