
export function generateSheet(style) {
    return render(normalize(style))
}


function render(style, padding = '') {
    let res = ''

    for (let [key, value] of objToPairs(style, true)) {
        key = stripComments(key)

        if (isObject(value)) {
            res += padding + key + ' {\n'
            res += render(value, padding + '  ')
            res += padding + '}\n\n'
            continue
        }

        let joinChar = isAtRule(key) ? '' : ':'

        res += padding + key + joinChar + ' ' + value + ';\n'
    }

    return res
}

function isAtRule(str) {
    return str.startsWith('@')
}


function stripComments(str) {
    return str.replace(/\/\*.*\*\//g, '')
}


export function normalize(style) {
    const res = {}
    const blocks = flattenNestedObject(style)

    for (let [path, dec] of blocks) {

        dec = normalizeBlock(dec)

        let targetDec = res

        for (let segment of fixPath(path)) {

            if (!targetDec.hasOwnProperty(segment)) {
                targetDec[segment] = {}
            }

            targetDec = targetDec[segment]
        }

        Object.assign(targetDec, dec)
    }

    return res
}

/**
 * Given an array of strings representing the path of a declaration block in the 
 * style object, it bubbles up the at-rules, merges them if possible and merges 
 * the nested normal selectors as well
 */
function fixPath(path) {
    const [atRules, selectors] = sieve(isAtRule, path)
    const res = mergeAtRules(atRules)
    
    if (selectors.length) {
        res.push(joinSelectors(selectors))
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


/**
 * Given an array of at-rules, it merges those rules that can be merged and returns
 * a new array with the resulting rules
 */
function mergeAtRules(rules) {
    const res = []

    const parsedRules = rules.map(parseAtRule)  // still ordered
    const rulesByKeyword = groupBy(r => r.keyword, parsedRules)
    const processedKeywords = Object.create(null)

    let atRule

    for (let { keyword, condition } of parsedRules) {
        if (processedKeywords[keyword]) {
            continue
        }

        // If it is not mergeable, reconstruct it and push it
        if (!mergeableRuleKeywords.hasOwnProperty(keyword)) {
            atRule = buildAtRule(keyword, [condition])
            res.push(atRule)
            continue
        }

        atRule = buildAtRule(keyword, rulesByKeyword[keyword].map(r => r.condition))
        res.push(atRule)

        processedKeywords[keyword] = true
    }

    return res
}

function buildAtRule(keyword, conditions) {
    const joinedCond = conditions.join(' and ')
    return '@' + keyword + (joinedCond ? ' ' + joinedCond : '')
}


// Keywords of at-rules that can be merged
// Based on https://developer.mozilla.org/en/docs/Web/CSS/At-rule
const mergeableRuleKeywords = {
    media: true, 
    supports: true, 
    document: true,
}


function groupBy(key, items) {
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

/**
 * Given a at-rule string, it parses and returns an object containing the keyword
 * and the body (the rest).
 *
 * @media screen => { keyword: 'media', condition: 'screen' }
 */
function parseAtRule(ruleStr) {
    let [, keyword, condition] = /@([a-zA-Z\-]*)(.*)/.exec(ruleStr)

    return { keyword, condition: condition.trim() }
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
