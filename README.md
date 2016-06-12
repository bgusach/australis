# Sierra

## What?
Sierra is a tool to generate CSS from plain Javascript. It does not have any
superpowers or overcomplex API: it does only one thing, and does it well.

## Why?
Writing raw CSS can easily get quite tedious a task, and that is the reason for the
rise of the CSS preprocessors like less, sass, stylus, etc. However, those entail
learning yet another new language and commiting to memory details about how to declare
variables or functions, scopes, etc.  But why not using Javascript to define our style? 
chances are you already know it if you are reading this. 

There are already out there some solutions that use Javascript 
for this purpose, but they are absurdly complex and suffer from feature creep.

Sierra however, aims for simplicity. Its name stands for saw in Spanish. Think of a handsaw.
How long does it take to learn its purpose and interface, and then use it properly? 
that is the minimalism this project strives for.


## How?
There are actually very few things to learn to start using sierra. The style
information has to be stored in a plain Javascript object, saved in a module and 
exported as `default`. The extension `.css.js` is recommended to make the purpose crystal clear.

Then, these are the conventions you have to learn:

- In order to reduce the amount of string quoting, the name of the properties can be 
  written as camelCase and will be automatically converted to dashes. For instance 
  `minWidth` will result in `min-width`

- Nesting selectors results in properly combined flattened selectors

- Nesting selectors and at-rules results in bubbling of the at-rules to the top.

To generate the style sheet, just call `sierra path/to/style.css.js`, optionally
passing an output path as well.


### Example

This style declaration:

```javascript
// style.css.js
const blue = '#00F'

exports.default = {
    '.class1': {
        minWidth: '40px',
        zIndex: 10,

        '.class2': {
            minHeight: '300px',
            color: blue,
        },

        '@media screen and (max-width: 1000px)': {
            paddingLeft: '20px',
        }
    },

    '.class3': {
        backgroundColor: blue,
    },
}
```

Will generate the following style sheet:

```css
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

@media screen and (max-width: 1000px) {
  .class1 {
    padding-left: 20px;
  }

}
```


## Roadmap
- Useful helpers
- Full support for at-rules (nesting does not completely work right now)
- Integration with workflows
- Dependency injection to allow custom behaviour

