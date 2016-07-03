# Australis
[![npm](https://img.shields.io/npm/l/australis.svg?maxAge=2592000)]()
[![npm](https://img.shields.io/npm/v/australis.svg?maxAge=2592000)]()
[![SemVer](http://img.shields.io/:semver-2.0.0-brightgreen.svg)]()

## What?
`australis` is a tool to generate CSS from plain JavaScript. It does not have any
superpowers or overcomplex API: it does only one thing, and does it well.

It is important to mention that this tool does not check the validity of the result.
Inconsistent inputs will produce inconsistent outputs. If some extra validation is needed,
it is recommended add a tool like [csslint][csslint] to the chain.

## Why?
Writing raw CSS can easily get quite tedious a task, and that is the reason for the
rise of the CSS preprocessors like [less][less], [sass][sass], [stylus][stylus], etc. However, 
those entail learning yet another new language and commiting to memory details about how to declare
variables or functions, scopes, etc.  But why not using JavaScript to define our style? 
chances are you already know it if you are reading this. 

There are already out there some solutions that use JavaScript 
for this purpose, mainly [absurdjs][absurdjs] and [restyle][restyle], but they don't target the 
same goals as this project. `absurdjs` is powerful, too powerful in that it does way too many things
which turns out in a complex API. `restyle` is quite simple, but its API is not so clear, especially
when it comes to add vendor prefixes, and it misses very useful features like selector nesting.

`australis` aims first of all for simplicity, but does not want to miss out on the useful stuff that 
actually justifies the usage of an extra tool instead of writing raw CSS.


## Example

This is an example of a style sheet defined in `australis`:

```javascript
// Value definition
const blue = '#00F'

export default {
    '.class1': {
        minWidth: '40px',

        zIndex: 10,

        // Nested selector
        '.class2': {
            minHeight: '300px',
            color: blue,
        },

        // Nested media query
        '@media screen': {
            paddingTop: '10px',

            // Deeper nesting of media query
            '@media (max-width: 1000px)': {
                paddingLeft: '20px',
            }
        }
    },

    '.class3': {
        backgroundColor: blue,
    },
}
```

And the generated style sheet will look like this:

```css
@media screen {
  .class1 {
    padding-top: 10px;
  }
}

@media screen and (max-width: 1000px) {
  .class1 {
    padding-left: 20px;
  }
}

.class1 {
  min-width: 40px;
  z-index: 10;
}

.class1 .class2 {
  color: #00F;
  min-height: 300px;
}

.class3 {
  background-color: #00F;
}
```

## How?

As seen in the example, the style has to be defined in a plain JavaScript object, and then
it has to be `export default`'ed (or `exports.default = ...` if using CommonJS)

These are the conventions you have to learn:

- If an object is defined within an object, it is understood as nesting and results in 
  merging the selectors or the at-rules if possible (only at-rules `@media`, `@document` or `@supports` are 
  merged). The merging always has an "and" meaning. Therefore if `.class2` is nested within `.class1`, the
  selector for the declaration block defined within `.class2` will be `.class1 .class2`. Same goes for at-rules
  although these will be bubbled up and show up before the normal selectors.

- Properties containing a dash can be defined in camelCase and they will be automatically 
  transformed to dashed form. For instance `minWidth` will result in `min-width`

- If a property contains a comment in the form `/* comment */`, the comment itself will be not be in the
  output

Then, to generate the style sheet, just call `australis path/to/style.css.js`, optionally
passing an output path as well.

While the previously explained is the core of `australis` and it is enough to get the ball rolling, 
there are a few tools defined in the `tools` module that will help you with typical CSS tasks. Those
are described in the API section

## Install

This package is on `npm` so just:

```
npm install australis --save-dev
```

## API

### australis.generateCSS(style)

This function is the core of the package. It receives a `australis` style object and returns the generated 
CSS string. The CLI API is just a wrapper around this.

The result will be sorted in the following order:
- `@charset` at-rules
- `@include` at-rules
- Rest of at-rules sorted alphabetically
- Rest sorted alphabetically

If this package is to be used on the browser, this method must be called and its return value
appended to a style tag (a bundling engine like `browserify` or `webpack` is needed to bring this 
to the browser)


### tools.mix(...objects)

Function to perform mixins. Receives any number of objects, and returns a shallow merge of all of them.
If falsy values are passed, they will be ignored, so that it is easy to conditionally include mixins.

Usage example:

```javascript
import { mix } from 'australis/tools'

// This is the mixin
const square = {
    width: '50px',
    height: '50px',
}

const condition = false

export default {
    '.class1': mix(
        square,
        {
            backgroundColor: 'red',
        }
    ),

    '.class2': mix(
        square & condition,  
        {
            position: 'float',
            padding: '1px 1px 3px 10px',
        }
    )
}
```

Output:

```css
.class1 {
  background-color: red;
  height: 50px;
  width: 50px;
}

.class2 {
  padding: 1px 1px 3px 10px;
  position: float;
}
```

### tools.changeLight(col, factor)

Given `col` as a hex string (e.g. `#aabbcc` or `#abc`), and `factor` as number, each channel
of the color is multiplied by the factor, and the result is returned as a hex string.

If any channel goes out of the `0-ff` range, it will be capped to `0` or `ff`.

Example:

```javascript
import { changeLight } from '../tools'

const color = '#aabbcc'

export default {
    '.bright': {
        backgroundColor: changeLight(color, 1.5)
    },

    '.dark': {
        backgroundColor: changeLight(color, 0.5)
    },
}
```

Result:

```css
.bright {
  background-color: #ffffff;
}

.dark {
  background-color: #555e66;
}
```


### tools.prefix(prop, value, prefixes = ['webkit', 'moz', 'ms', 'o'])

Given a property `prop`, a value `value` and optionally an array of prefixes,
a new object will be returned, having the original property and all its prefixed variants as keys,
and `value` for each value (it can be used with at-rules as well, like `key-frames`)

Example:

```javascript
import { prefix } from 'australis/tools'

export default {
    '.animated': prefix('animation', 'slide')
}
```

Result:

```css
.animated {
  -moz-animation: slide;
  -ms-animation: slide;
  -o-animation: slide;
  -webkit-animation: slide;
  animation: slide;
}
```


### tools.multivalue(prop, values)
Given a property and an array of values, it returns an object
that will be rendered as if the property was defined for each value.

Example:

```javascript
import { multivalue } from 'australis/tools'

export default {
    '.my-flex-box': multivalue('display', ['-ms-flexbox', '-webkit-flex', 'flex']),
}
```

Result:

```css
.my-flex-box {
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
}
```

Note: this takes profit of the `/* comment */` stripping.


[absurdjs]: https://github.com/krasimir/absurd
[restyle]: https://github.com/WebReflection/restyle#restyle
[csslint]: https://github.com/CSSLint/csslint
[less]: https://github.com/less/less.js
[sass]: https://github.com/sass/sass
[stylus]: https://github.com/stylus/stylus
