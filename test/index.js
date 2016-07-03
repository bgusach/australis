'use strict'

const tape = require('tape')
const generateSheet = require('..').generateSheet
const tools = require('../tools')


/**
 * Small helper to normalize CSS strings so that they can be compared ignoring
 * whitespaces, linebreaks etc
 */
function normalizeCSS(str) {
    return str.replace(/\s+/g, ' ').trim()
}


tape('mix: basic mixing works', t => {
    const res = tools.mix({a: 1, b: 1, c: 1}, {b: 2}, {c: 3})
    t.deepEqual(res, {a: 1, b: 2, c: 3})
    t.end()
})


tape('mix: falsy values are ignored while mixing', t => {
    const res = tools.mix({ a: 2 }, false, { b: 3 }, null, undefined)
    const expected = { a: 2, b: 3 }

    t.deepEqual(res, expected)
    t.end()
})


tape('changeLight', t => {
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


tape('prefixing', t => {
    let res = tools.prefix('borderRadius', 10)
    let expected = {
        '-webkit-borderRadius': 10,
        '-moz-borderRadius': 10,
        '-ms-borderRadius': 10,
        '-o-borderRadius': 10,
        'borderRadius': 10,
    }

    t.deepEqual(res, expected)

    res = tools.prefix('borderRadius', 20, ['hey', 'ya'])
    expected = {
        '-hey-borderRadius': 20,
        '-ya-borderRadius': 20,
        'borderRadius': 20,
    }

    t.deepEqual(res, expected)

    res = tools.prefix(
        '@keyframe hey', 
        { 
            from: { top: '0px' }, 
            to: { top: '10px' }
        }, 
        ['webkit']
    )

    expected = {
        '@keyframe hey': { 
            from: { top: '0px' }, 
            to: { top: '10px' }
        }, 
        '@-webkit-keyframe hey': { 
            from: { top: '0px' }, 
            to: { top: '10px' }
        }, 
    }

    t.deepEqual(res, expected)
    res = generateSheet(res)
    expected = `
        @-webkit-keyframe hey {
            from { top: 0px; }
            to { top: 10px; }
        }

        @keyframe hey {
            from { top: 0px; }
            to { top: 10px; }
        }
    `

    t.equal(normalizeCSS(res), normalizeCSS(expected))
    t.end()
})


tape('multivalue: multiple values for one property', t => {
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


tape('If nestig a conditional at-rule with an OR inside, brackets are added where necessary', t => {
    const res = generateSheet({
        '@media screen or print': {
            '@media (min-width: 700px)': {
                '.class1': {
                    width: '50px',
                }
            }
        }
    })

    const exp = `
        @media (screen or print) and (min-width: 700px) {
            .class1 {
                width: 50px;
            }
        }
    `

    t.equal(normalizeCSS(res), normalizeCSS(exp))
    t.end()
})


tape('Render order: @charset, @include, rest of at-rules alphabetically, selectors alphabetically', t => {
    const res = generateSheet({
        '.class1': {
            zIndex: 10,

            '@media screen': {
                zIndex: 20,
            },

        },

        '.class2': {
            zIndex: 40,
        },

        '@include': '"someother.css"',
        '@charset': '"utf-8"',
    })

    const exp = `
        @charset "utf-8";

        @include "someother.css";

        @media screen {
            .class1 {
                z-index: 20;
            }
        }

        .class1 {
            z-index: 10;
        }

        .class2 {
            z-index: 40;
        }
    `
    t.equal(normalizeCSS(res), normalizeCSS(exp))
    t.end()
})
