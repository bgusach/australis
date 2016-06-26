/**
 * Translates a sierra style object into its corresponding string
 */
export function generateSheet(style) {
    return render(resolveNesting(style))
}


/**
 * Given a normalized style object, it returns a string with the generated CSS
 */
function render(style, padding = '') {
    let res = ''
    const keys = Object.keys(style).sort(compareRules)

    for (let key of keys) {
        let value = style[key]
        key = stripComments(key)

        if (isObject(value)) {
            res += padding + key + ' {\n'
            res += render(value, padding + '  ')
            res += padding + '}\n\n'
            continue
        }

        let joinChar = isAtRule(key) ? '' : ':'

        res += padding + dasherize(key) + joinChar + ' ' + value + ';\n'
    }

    return res
}

/**
 * Function to sort rules before rendering
 */
function compareRules(a, b) {

    // @charset rule has the highest prio
    if (isCharsetRule(a) && !isCharsetRule(b)) {
        return -1
    }

    if (!isCharsetRule(a) && isCharsetRule(b)) {
        return 1
    }

    // @include rule has the 2nd highest prio
    if (isIncludeRule(a) && !isIncludeRule(b)) {
        return -1
    }

    if (!isIncludeRule(a) && isIncludeRule(b)) {
        return 1
    }

    // At-rules have higher prio than the rest
    if (isAtRule(a) && !isAtRule(b)) {
        return -1
    }

    if (!isAtRule(a) && isAtRule(b)) {
        return 1
    }

    // Otherwise just compare normally
    if (a < b) {
        return -1
    }

    if (a === b) {
        return 0
    }

    return 1
}


function isCharsetRule(str) {
    return str.startsWith('@charset')
}


function isIncludeRule(str) {
    return str.startsWith('@include')
}


function isAtRule(str) {
    return str.startsWith('@')
}


/**
 * Given a string, returns a new string with the comments removed.
 * Comments format is / * ... * / (without the spaces)
 */
function stripComments(str) {
    return str.replace(/\/\*.*\*\//g, '')
}


/**
 * Given a style object, it returns a new object where all the nesting has been
 * resolved
 */
function resolveNesting(style) {
    const res = {}
    const blocks = flattenNestedObject(style)

    for (let [path, dec] of blocks) {

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
    // If multiple conditions, and any has an or inside, wrap with brackets
    if (conditions.length > 1 && conditions.some(x => /or[ (]/.test(x))) {
        conditions = conditions.map(x => {
            return x.startsWith('(') && x.endsWith(')') ? x : '(' + x + ')'
        })
    }
    
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

    for (let key of Object.keys(obj)) {
        let val = obj[key]

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


function dasherize(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
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


/**
 * Given a callback function to extract the key two group, and an array of elements,
 * it returns an object where the keys are the values returned by the callback
 * and the values arrays of elements that shared the same key.
 */
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

