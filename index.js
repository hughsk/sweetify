var resolve = require('browser-resolve')
var through = require('through')
var sweet = require('sweet.js')
var map = require('map-async')
var path = require('path')
var fs = require('fs')

module.exports = sweetify

function sweetify(file) {
  if (path.extname(file) !== '.sjs') return through()

  var buffer = ''

  return through(write, end)

  function write(data) {
    buffer += data
  }

  function end() {
    var inline = []
    var stream = this

    walk(sweet.parse(buffer), function(node) {
      if (node.type !== 'ExpressionStatement') return

      var exp = node.expression

      if (
           !exp.callee
        || !exp.callee.object
        ||  exp.callee.object.name !== 'require'
        ||  exp.callee.property.name !== 'macro'
        || !exp.arguments
        || !exp.arguments[0]
        ||  exp.arguments[0].type !== 'Literal'
      ) return

      var macro = exp.arguments[0].value
      if (inline.indexOf(macro) === -1) inline.push(macro)
    })

    map(inline, function(value, key, next) {
      resolve(value, {
        filename: file
      }, function(err, dest) {
        if (err) return next(err)
        fs.readFile(dest, 'utf8', function(err, contents) {
          if (err) return next(err)
          buffer = contents + '\n' + buffer
          next()
        })
      })
    }, function(err, result) {
      if (err) return stream.emit('error', err)
      if (inline.length) {
        buffer = 'if (!("macro" in require)) require.macro = function(){};\n' + buffer
      }

      try {
        buffer = sweet.compile(buffer)
      } catch(e) {
        return stream.emit('error', e)
      }

      stream.queue(buffer)
      stream.queue(null)
    })
  }

  // via https://github.com/substack/node-falafel/blob/08fce3f8842d308dfe436f0ecb6e2b5b52e0e022/index.js#L41-61
  // thanks substack!
  function walk(node, fn) {
    Object.keys(node).forEach(function(key) {
      if (key === 'parent') return

      var child = node[key]
      if (Array.isArray(child)) {
        child.forEach(function(c) {
          if (c && typeof c.type === 'string') {
            walk(c, fn)
          }
        })
      } else
      if (child && typeof child.type === 'string') {
        walk(child, fn)
      }

      fn(node)
    })
  }
}
