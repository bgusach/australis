'use strict'

const mix = (...objs) => Object.assign({}, ...objs)

exports.mix = mix


exports.render = function render(style) {
    console.log(style)
    _render(style)
}


function _render(style, indent = '') {

    for (let [key, value] of objToPairs(style, true)) {
        if (isObject(value)) {
            print(indent + key + ' {\n')
            _render(value, indent + '  ')
            print(indent + '}\n\n')
            continue
        }

        print(indent + key + ': ' + value + ';\n')
    }
}


exports.normalize = (style) => {
    const res = {}
    const blocks = extractDeclarations(style)

    for (let [path, dec] of blocks) {
        let [atRules, selectors] = sieve(x => x.startsWith('@'), path)
        
        let atRule = joinAtRules(atRules)
        let selector = joinSelectors(selectors)

        dec = normalizeBlock(dec)

        // If at-rule AND selector, the top-level at-rule block is created if missing
        // and within it a key for the selector is defined for the block declaration
        if (atRule && selector) {
            if (!res[atRule]) {
                res[atRule] = {}
            }

            res[atRule][selector] = dec
            continue
        }

        // Special case for top-level non-nestable at-rules. This is the only case we can have of
        // direct key-value pair. The recognized block is the top level of the CSS document.
        if (!atRule && !selector) {
            // TODO These at-rules need quotes
            Object.assign(res, dec)
            continue
        }

        // Standard rule case with selector + declaration block
        res[selector] = dec

    }

    return res
}


/*
 * Given a property-value block, a new object with the normalized properties is returned
 */
const normalizeBlock = (block) => objFromPairs(Object.keys(block).map(key => [dasherize(key), block[key]]))


const joinSelectors = (selectors) => {
    return selectors.join(' ')
}


const joinAtRules = (rules) => {
    // TODO: implement proper at-rules logic
    return rules.join(' and ')
}


function extractDeclarations(dec, path = [], carrier = []) {
    const plainDec = {}

    for (let [key, val] of objToPairs(dec)) {
        if (isObject(val)) {
            extractDeclarations(val, path.concat(key), carrier)
            continue
        }

        plainDec[key.trim()] = val
    }

    if (!isEmpty(plainDec)) {
        carrier.push([path, plainDec])
    }

    return carrier
}


function pad(text, count) {
    return ' '.repeat(count) + text
}


function objFromPairs(pairs) {
    const res = {}
    
    for (let [key, val] of pairs) {
        res[key] = val
    }

    return res
}


const print = process.stdout.write.bind(process.stdout)
// const print = console.log



function objToPairs(obj, sorted = false) {
    const keys = Object.keys(obj)
    
    if (sorted) {
        keys.sort()
    }

    return keys.map(key => [key, obj[key]])
}


function isNumber(value) {
    return typeof value === 'number' || value instanceof Number
}


function isObject(value) {
    return (
        value !== null
        && value instanceof Object 
        && !(value instanceof Array) 
        && typeof value !== 'function'
    )
}


const isEmpty = (obj) => {
    for (let x in obj) {
        if (obj.hasOwnProperty(x)) {
            return false
        }
    }

    return true
}

const dasherize = (str) => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()

const sieve = (pred, array) => {
    const truthy = []
    const falsy = []

    for (let item of array) {
        (pred(item) ? truthy : falsy).push(item)
    }

    return [truthy, falsy]
}
