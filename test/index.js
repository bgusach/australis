'use strict'

const tape = require('tape')
const tools = require('../tools')
const generateSheet = require('..').generateSheet


/**
 * Small helper to normalize CSS strings so that they can be compared ignoring
 * whitespaces, linebreaks etc
 */
function normalizeCSS(str) {
    return str.replace(/\s+/g, ' ').trim()
}


tape('tools.mix basic mixing works', t => {
    const res = tools.mix({a: 1, b: 1, c: 1}, {b: 2}, {c: 3})
    t.deepEqual(res, {a: 1, b: 2, c: 3})
    t.end()
})


tape('tools.mix falsy values are ignored while mixing', t => {
    const res = tools.mix({ a: 2 }, false, { b: 3 }, null, undefined)
    const expected = { a: 2, b: 3 }

    t.deepEqual(res, expected)
    t.end()
})


tape('tools.changeLight', t => {
    const pairs = [
        [tools.changeLight('#3388cc', 1.25), '#40aaff'],
        [tools.changeLight('#40aaff', 0.8), '#3388cc'],
        [tools.changeLight('#999999', 100), '#ffffff'],
        [tools.changeLight('#999999', 0), '#000000'],
    ]

    for (let [res, exp] of pairs) {
        t.equal(res, exp)
    }

    t.end()
})


tape('tools.prefixing', t => {
    let res = tools.prefix('borderRadius', 10)
    let expected = {
        'WebkitBorderRadius': 10,
        'MozBorderRadius': 10,
        'MsBorderRadius': 10,
        'OBorderRadius': 10,
    }

    t.deepEqual(res, expected)

    res = tools.prefix('borderRadius', 20, ['hey', 'ya'])
    expected = {
        'HeyBorderRadius': 20,
        'YaBorderRadius': 20,
    }

    t.deepEqual(res, expected)

    t.end()
})


tape('tools.multivalue: multiple values for one property', t => {
    const res = tools.multivalue('prop', [1, 2, 3, 'lol'])
    const exp = {
        'prop/*0*/': 1,
        'prop/*1*/': 2,
        'prop/*2*/': 3,
        'prop/*3*/': 'lol',
    }
    t.deepEqual(res, exp)
    t.end()
})


tape('Rendering simple style', t => {
    const res = generateSheet({
        selector: {
            minWidth: '34px',
            borderWidth: '10px',
            backgroundColor: '#cccccc'
        }
    })

    const expected = `
        selector {
          background-color: #cccccc;
          border-width: 10px;
          min-width: 34px;
        }
    `

    t.deepEqual(normalizeCSS(res), normalizeCSS(expected))

    t.end()
})


tape('Rendering nested style', t => {
    const res = generateSheet({
        selector: {
            subSelector: {
                minWidth: '34px',
                borderWidth: '10px',
                backgroundColor: '#cccccc'
            }
        }
    })

    const expected = `
        selector subSelector {
            background-color: #cccccc;
            border-width: 10px;
            min-width: 34px;
        }
    `

    t.deepEqual(normalizeCSS(res), normalizeCSS(expected))

    t.end()
})


tape('Non-nested media queries are reorganized properly', t => {
    const res = generateSheet({
        div: {
            height: '50px',
            '@media screen': {
                width: '100px', 
                '.class': {
                    zIndex: 45,
                }
            }
        }
    })

    const expected = `
        @media screen {
            div {
                width: 100px;
            }

            div .class {
                z-index: 45;
            }
        }

        div {
            height: 50px;
        }
    `

    t.deepEqual(normalizeCSS(res), normalizeCSS(expected))
    t.end()
})

tape('Non-nestable at-rules are identified properly', t => {
    const res = generateSheet({
        '@charset': '"utf-8"',
        div: {
            width: '10px',
        }
    })

    const expected =  `
        @charset "utf-8";

        div {
            width: 10px;
        }
    `
    t.deepEqual(normalizeCSS(res), normalizeCSS(expected))

    t.end()
})





tape('@media queries nesting results in AND-ed elements', t => {
    const res = generateSheet({
        '@media screen': {
            '.class1': {
                fontSize: '10px',
                '@media (min-width: 500px)': {
                    color: 'red',
                },
            },
        },
    })

    const expected = `
        @media screen {
            .class1 {
                font-size: 10px;
            }
        }

        @media screen and (min-width: 500px) {
            .class1 {
                color: red;
            }
        }
    `

    t.equal(normalizeCSS(res), normalizeCSS(expected))
    t.end()
})


tape('Regular/flat at-rules like @import @charset or @namespace work fine', t => {
    let res = generateSheet({'@charset': '"utf-8"'})
    let expected = '@charset "utf-8";'

    t.equal(normalizeCSS(res), normalizeCSS(expected))

    res = generateSheet({'@import': '"some.css"'}).trim()
    expected = '@import "some.css";'
    t.equal(normalizeCSS(res), normalizeCSS(expected))

    res = generateSheet({'@namespace': 'svg url(http://www.w3.org/2000/svg)'}).trim()
    expected = '@namespace svg url(http://www.w3.org/2000/svg);'
    t.equal(res, expected)

    t.end()
})

// TODO: test rendering order @charset, etc...


tape('font-face at-rule works', t => {
    let res = generateSheet({
        '@font-face': {
            fontFamily: '"Bitstream Vera Serif Bold"',
            src: 'url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf")'
        }
    })

    let expected = `
        @font-face {
          font-family: "Bitstream Vera Serif Bold";
          src: url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf");
        }
    `
    t.equal(normalizeCSS(res), normalizeCSS(expected))
    t.end()
})

tape('page at-rule', t => {
    const res = generateSheet({
        '@page': {
            margin: '2px',
        },
        // TODO: consider if we want to allow @page nesting
        '@page :first': {
            marginTop: '10px',
        }
    })

    const exp = `
        @page { 
            margin: 2px;
        }

        @page :first {
          margin-top: 10px;
        }
    `
    t.equal(normalizeCSS(res), normalizeCSS(exp))
    t.end()
})

tape('Only conditional at-rules are AND-ed. Other types are left nested', t => {
    const res = generateSheet({
        '@media screen': {
            '@media (min-width: 700px)': {
                '@keyframes move': {
                    '0%': {
                        transform: 'translateX(50%)',
                    },

                    '100%': {
                        transform: 'translateX(-50%)',
                    },
                }
            }
        }
    })

    const exp = `
        @media screen and (min-width: 700px) {
            @keyframes move {
                0% {
                    transform: translateX(50%);
                }
                100% {
                    transform: translateX(-50%);
                }
            }
        }
    `

    t.equal(normalizeCSS(res), normalizeCSS(exp))
    t.end()
})
