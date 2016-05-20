function merge(...objs) {
    const res = Object.create(null)

    objs.forEach(obj => {
        Object.keys(obj).forEach(key => {
            res[key] = obj[key]
        })
    })

    return res
}

function flatMerge(objs) {
    objs = objs.filter(Boolean).map(o => isArray(o) ? flatMerge(o) : o)

    for (let obj of objs) {

        for (let [key, val] of traverseObject(obj)) {

            if (isArray(val)) {
                obj[key] = flatMerge(val)
            }

        }
    }

    return Object.assign.apply(null, [{}, ...objs])
}

const isArray = Array.isArray


function traverseObject(obj) {
    const res = []

    for (key of Object.keys(obj)) {
        res.push([key, obj[key]])
    }

    return res
}


exports.estilo = function estilo(style) {

    if (!isArray(style)) {
        style = [style]
    }

    return flatMerge(style)
}

exports.Sheet = function Sheet(sheets) {
    if (sheets === undefined) throw new TypeError('No data passed')

    if (!isArray(sheets)) {
        sheets = [sheets]
    }

    // TODO: flatten completely the array?
    
    const sheet = merge2(sheets)
    const res = {}
    let fixedProp
    let declaration
    let value

    Object.keys(sheet).forEach(selector => {
        declaration = sheet[selector]

        if (!isPlainObject(declaration)) {
            throw new TypeError('Not expected: ' + JSON.stringify(declaration))
        }

        Object.keys(declaration).forEach(property => {
            value = declaration[property]

            // accepted: string, number, array, object
            if (isString(value) || isNumber(value)) {
                declaration[property] = value
                return true
            }

            if (isPlainObject(value)) {
                value = [value]
            }

            if (isArray) {
                value = merge2(value) 
                declaration[property] = value
                return true
            }

            throw new TypeError('Unexpected value: ' + JSON.stringify(value))

        })

        res[selector] = fixDeclarationKeys(declaration)
    })

    return res
}

function isNumber(value) {
    return typeof value === 'number' || value instanceof Number
}


function isString(value) {
    return typeof value === 'string' || value instanceof String
}

function isPlainObject(value) {
    return (
        value instanceof Object 
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

