'use strict'

const tape = require('tape')
const estilo = require('../src/index').estilo
const _ = require('lodash')

tape('falsy values produce empty style', t => {
    let style
    for (let value of [null, undefined, false]) {
        style = estilo(value)

        t.ok(_.isObject(style) && _.isEmpty(style), value + ' produced empty result')
    }

    t.end()
})

tape('plain style is returned as is', t => {
    const style = {
        'some selector': {
            someProp: 'some value',
        }
    }
    t.deepEqual(style, estilo(style))
    t.end()
})

tape('two rules are properly merged', t => {
    const style = estilo([
        {
            'a': {
                width: 1,
            },

            'b': {
                height: 1,
            }
        },
        {
            'b': {
                height: 2,
            }
        },
    ])

    const expected = {
        'a': {
            width: 1,
        },

        'b': {
            height: 2,
        }
    }

    t.deepEqual(style, expected)
    t.end()
})


tape('two declaration blocks are properly merged', t => {
    const style = estilo({
        sel: [
            {
                width: 1,
                height: 1,
            },
            {
                height: 2,
                borderWidth: 2,
            }
        ]
    })

    const expected = {
        sel: {
            width: 1,
            height: 2,
            borderWidth: 2,
        }
    }
    t.deepEqual(style, expected)
    t.end()
})

tape('', t => {
    t.end()
})

