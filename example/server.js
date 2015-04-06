// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var statto = require('statto')

// local
var stattoBackendFs = require('../')

// --------------------------------------------------------------------------------------------------------------------

// create the backend first
var backend = stattoBackendFs(path.join(__dirname, 'store'))

// if there are any errors in the backend, let's just log them
backend.on('err', function(err) {
  console.error('--- Err ---')
  console.error(err)
})

// setup the backend first (ie. create directories, etc)
backend.setup(function(err) {
  // now create and start the server
  var server = statto()
  var stattoServer = statto(function(err, port) {
    console.log('Stats server is listening on port %s', port)
  })

  // every time we get some stats, send them to the backend
  stattoServer.on('stats', backend.stats.bind(backend))

  // as an example, let's also listen for stats here so we can log them to the console
  stattoServer.on('stats', function(stats) {
    console.log('--- %s ---', stats.ts)
    console.log(JSON.stringify(stats, null, '  '))
  })
})

// --------------------------------------------------------------------------------------------------------------------
