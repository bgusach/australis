'use strict'

const mix = (...objs) => Object.assign({}, ...objs)

exports.mix = mix


const flattenRule = (selector, decBlock) => {
    let res = {}

    for (let [prop, value] of traverseObject(decBlock)) {

        if (!isNumber(value) && !isString(value) && !isObject(value)) {
            throw new TypeError(
                `Invalid value: ${value}`
                + ` in selector: "${selector}",`
                + ` property: "${prop}"`
            )
        }
        
        if (isObject(value)) {
            // Media query
            if (prop.startsWith('@media')) {
                res[prop] = res[prop] || {}
                res[prop][selector] = value

            // Nested selector
            } else {
                console.log('nested!')
                let newRules = flattenRule([selector, prop].join(' '), value)
                Object.assign(res, newRules)
            }
            continue
        }

        res[selector] = res[selector] || {}
        res[selector][prop] = value
    }

    return res
}


function traverseObject(obj) {
    return Object.keys(obj).map(key => [key, obj[key]])
}


function isNumber(value) {
    return typeof value === 'number' || value instanceof Number
}


function isString(value) {
    return typeof value === 'string' || value instanceof String
}

function isObject(value) {
    return (
        value !== null
        && value instanceof Object 
        && !(value instanceof Array) 
        && typeof value !== 'function'
    )
}

function fixDeclarationKeys(declaration) {
    const res = {}

    Object.keys(declaration).forEach(prop => {
        fixedProp = prop.replace(/_/g, '-')
        res[fixedProp] = declaration[prop]
    })

    return res
}

