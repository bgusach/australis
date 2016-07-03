export function isObject(value) {
    return (
        value !== null
        && value instanceof Object 
        && !(value instanceof Array) 
        && typeof value !== 'function'
    )
}


export function isEmpty(obj) {
    for (let x in obj) {
        if (obj.hasOwnProperty(x)) {
            return false
        }
    }

    return true
}


/**
 * Given a predicate function and an array, it returns it returns an array
 * of two arrays. The first one contains the elements that satisfied the predicate
 * and the second one, those that did not.
 */
export function sieve(pred, array) {
    const truthy = []
    const falsy = []

    for (let item of array) {
        (pred(item) ? truthy : falsy).push(item)
    }

    return [truthy, falsy]
}


/**
 * Given a callback function to extract the key two group, and an array of elements,
 * it returns an object where the keys are the values returned by the callback
 * and the values arrays of elements that shared the same key.
 */
export function groupBy(key, items) {
    const res = Object.create(null)

    for (let item of items) {
        let val = key(item)

        if (!res[val]) {
            res[val] = []
        }

        res[val].push(item)
    }

    return res
}


export function isCharsetRule(str) {
    return str.startsWith('@charset')
}


export function isIncludeRule(str) {
    return str.startsWith('@include')
}


export function isAtRule(str) {
    return str.startsWith('@')
}

