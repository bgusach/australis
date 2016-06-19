
export function generateSheet(style) {
    return render(normalize(style))
}


function render(style, padding = '') {
    let res = ''

    for (let [key, value] of objToPairs(style, true)) {
        if (isObject(value)) {
            res += padding + key + ' {\n'
            res += render(value, padding + '  ')
            res += padding + '}\n\n'
            continue
        }

        res += padding + stripComments(key) + ': ' + value + ';\n'
    }

    return res
}


function stripComments(str) {
    return str.replace(/\/\*.*\*\//g, '')
}


export function normalize(style) {
    const res = {}
    const blocks = flattenNestedObject(style)

    for (let [path, dec] of blocks) {

        dec = normalizeBlock(dec)

        // key-part defined at top-level (at-rules). Just set them at top level
        if (!path.length) {
            Object.assign(res, dec)
            continue
        }

        let [atRules, selectors] = sieve(x => x.startsWith('@'), path)
        
        let atRule = joinAtRules(atRules)
        let selector = joinSelectors(selectors)

        // If at-rule AND selector, the top-level at-rule block is created if missing
        // and within it a key for the selector is defined for the block declaration
        if (atRule && selector) {
            if (!res[atRule]) {
                res[atRule] = {}
            }

            res[atRule][selector] = dec
            continue
        }

        // Standard rule case with selector + declaration block
        res[selector] = dec

    }

    return res
}



/*
 * Given a property-value block, it returns new object with the properties normalized
 */
function normalizeBlock(block) {
    return objFromPairs(Object.keys(block).map(key => [dasherize(key), block[key]]))
}


function joinSelectors(selectors) {
    return selectors.join(' ')
}


function joinAtRules(rules) {
    // TODO: implement proper at-rules logic
    return rules.join(' and ')
}


/**
 * Given an arbitrarily nested object, it identifies the objects in the tree and 
 * returns them plus the path where it was found.
 */
function flattenNestedObject(obj, path = [], carrier = []) {
    const plainDec = {}

    for (let [key, val] of objToPairs(obj)) {
        if (isObject(val)) {
            flattenNestedObject(val, path.concat(key), carrier)
            continue
        }

        plainDec[key.trim()] = val
    }

    if (!isEmpty(plainDec)) {
        carrier.push([path, plainDec])
    }

    return carrier
}


function objFromPairs(pairs) {
    const res = {}
    
    for (let [key, val] of pairs) {
        res[key] = val
    }

    return res
}


function objToPairs(obj, sorted = false) {
    const keys = Object.keys(obj)
    
    if (sorted) {
        keys.sort()
    }

    return keys.map(key => [key, obj[key]])
}


function isObject(value) {
    return (
        value !== null
        && value instanceof Object 
        && !(value instanceof Array) 
        && typeof value !== 'function'
    )
}


function isEmpty(obj) {
    for (let x in obj) {
        if (obj.hasOwnProperty(x)) {
            return false
        }
    }

    return true
}


function dasherize(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
} 


/**
 * Given a predicate function and an array, it returns it returns an array
 * of two arrays. The first one contains the elements that satisfied the predicate
 * and the second one, those that did not.
 */
function sieve(pred, array) {
    const truthy = []
    const falsy = []

    for (let item of array) {
        (pred(item) ? truthy : falsy).push(item)
    }

    return [truthy, falsy]
}
