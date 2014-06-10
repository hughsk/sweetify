# sweetify [![deprecated](http://badges.github.io/stability-badges/dist/deprecated.svg)](http://github.com/badges/stability-badges) #

**This module has been replaced by [@andreypopp](http://github.com/andreypopp)'s implementation, which [you can find here](http://github.com/andreypopp/sweetify).**

A [browserify](http://browserify.org/) transform for
[sweet.js](http://sweetjs.org/), which brings hygienic macros to JavaScript.

## Installation ##

``` bash
npm install sweetify
```

## Usage ##

``` bash
browserify -t sweetify index.sjs
```

### `require.macro(file)` ###

You might want to have to avoid copying and pasting your macros between files,
so included is an unofficial means to `require` them into your script.

Take, for example, `first.sjs`:

``` javascript
// first.sjs
macro first {
  case ($a + $b) => { $a }
}
```

You can use `require.macro` to include its contents in your script.

``` javascript
// index.sjs
require.macro('./first.sjs')

var x = first(1 + 2)
console.log(x)
```

Bundling `index.sjs` will result in output along these lines:

``` javascript
// bundle.js
var x$2 = 1;
console.log(1);
```

`require.macro` uses [browser-resolve](http://ghub.io/browser-resolve) to find
the file too, so you can throw your macros up on NPM if you so please.

Note however that inlining is pretty rudimentary: it literally prepends the
file contents to your script before passing it to sweet.js. Pull requests are
welcome if you find a way to bend the parser to exclude everything but the
macros, or any other improvements you can think of :)
