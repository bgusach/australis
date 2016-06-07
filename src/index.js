'use strict'

const mix = (...objs) => Object.assign({}, ...objs)

exports.mix = mix


exports.render = function render(style) {
    _render(style, 0)
}


function _render(style, indent) {

    for (let [key, value] of traverseObject(style, true)) {
        print(pad(key, indent) + ' {')
        
        for (let [subkey, subvalue] of traverseObject(value, true)) {
            print(pad(subkey + ': ' + subvalue + ';', indent + 2))
        }

        print(pad('}\n', indent))
    }
}


exports.normalize = function normalize(style) {
    const res = {}

    const declarations = extractDeclarations(style)

    for (let [sel, dec] of declarations) {
        res[sel.join(' ')] = objFromPairs(Object.keys(dec).map(key => [dasherize(key), dec[key]]))
    }

    return res
}


function extractDeclarations(dec, path = [], carrier = []) {
    const plainDec = {}

    for (let [key, val] of traverseObject(dec)) {
        if (isObject(val)) {
            extractDeclarations(val, path.concat(key), carrier)
            continue
        }

        plainDec[key] = val
    }

    if (Object.keys(plainDec).length) {
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


const print = console.log


function traverseObject(obj, sorted = false) {
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

const dasherize = (str) => 
    str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()

