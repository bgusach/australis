# Sierra
[![npm](https://img.shields.io/npm/l/sierra.svg?maxAge=2592000)]()
[![npm](https://img.shields.io/npm/v/sierra.svg?maxAge=2592000)]()
[![SemVer](http://img.shields.io/:semver-2.0.0-brightgreen.svg)]()

## What?
Sierra is a tool to generate CSS from plain Javascript. It does not have any
superpowers or overcomplex API: it does only one thing, and does it well.

It is important to mention that this tool does not check the validity of the result.
Inconsistent inputs will produce inconsistent outputs. If some extra validation is needed,
it is recommended add a tool like [csslint][csslint] to the chain.

## Why?
Writing raw CSS can easily get quite tedious a task, and that is the reason for the
rise of the CSS preprocessors like [less][less], [sass][sass], [stylus][stylus], etc. However, 
those entail learning yet another new language and commiting to memory details about how to declare
variables or functions, scopes, etc.  But why not using Javascript to define our style? 
chances are you already know it if you are reading this. 

There are already out there some solutions that use Javascript 
for this purpose, mainly [absurdjs][absurdjs] and [restyle][restyle], but they don't target the 
same goals as this project. `absurdjs` is powerful, too powerful in that it does way too many things
which turns out in a complex API. `restyle` is quite simple, but its API is not so clear, especially
when it comes to add vendor prefixes, and it misses very useful features like selector nesting.

Sierra aims first of all for simplicity, but does not want to miss out on the useful stuff that 
actually justifies the usage of an extra tool instead of writing raw CSS.

Its name stands for saw in Spanish. Think of a handsaw. How long does it take to learn its purpose 
and interface, and then use it properly? that is the minimalism this project strives for.


## How?

Define your style object in a module, and `export default` it (or `exports.default = ...` if using CommonJS)

These are the conventions you have to learn:

- For properties containing a dash, you can define them in camelCase and it will be automatically 
  transformed to dashed form. For instance `minWidth` will result in `min-width`

- If an object is defined within an object, it is understood as nesting and results in 
  merging the selectors or the at-rules if possible (only at-rules `@media`, `@document` or `@supports` are 
  merged). The merging always has an "and" meaning. Therefore if `.class2` is nested within `.class1`, the
  selector for the declaration block defined within `.class2` will be `.class1 .class2`. Same goes for at-rules
  although these will be bubbled up and show up before the normal selectors.

Then, to generate the style sheet, just call `sierra path/to/style.css.js`, optionally
passing an output path as well.


### Example

This style declaration:

```javascript
const blue = '#00F'

export default {
    '.class1': {
        minWidth: '40px',
        zIndex: 10,

        '.class2': {
            minHeight: '300px',
            color: blue,
        },

        '@media screen': {
            paddingTop: '10px',

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

Will generate the following style sheet:

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


[absurdjs]: http://absurdjs.com/
[restyle]: https://github.com/WebReflection/restyle#restyle
[csslint]: https://github.com/CSSLint/csslint
[less]: https://github.com/less/less.js
[sass]: https://github.com/sass/sass
[stylus]: https://github.com/stylus/stylus
