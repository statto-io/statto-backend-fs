// --------------------------------------------------------------------------------------------------------------------
//
// statto-backend-fs/index.js
// 
// Copyright 2015 Tynio Ltd.
//
// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')
var util = require('util')

// npm
var fs = require('graceful-fs')
var async = require('async')
var mkdirp = require('mkdirp')
var glob = require('glob')
var through = require('through')
var stattoMerge = require('statto-merge')
var stattoProcess = require('statto-process')
var stattoBackend = require('statto-backend')

// --------------------------------------------------------------------------------------------------------------------
// module level

function noop(){}

// --------------------------------------------------------------------------------------------------------------------
// constructor

function StattoBackendFs(dir, opts) {
  if ( !dir ) {
    throw new Error('Provide a dir')
  }

  // default the opts to nothing
  this.dir      = dir
  this.rawDir   = path.join(dir, 'raw')
  this.statsDir = path.join(dir, 'stats')
  this.opts     = opts || {}
}

util.inherits(StattoBackendFs, stattoBackend.StattoBackendAbstract)

// --------------------------------------------------------------------------------------------------------------------
// methods

StattoBackendFs.prototype.setup = function setup(callback) {
  var self = this

  // make sure this directory exists
  async.each(
    [ self.dir, self.rawDir, self.statsDir ],
    function(dir, done) {
      console.log('dir=' + dir)
      mkdirp(dir, done)
    },
    callback
  )
}

StattoBackendFs.prototype.addRaw = function addRaw(raw, callback) {
  var self = this
  callback = callback || noop

  // create a unique filename, use the hash of the contents
  var hash = self._getHash(raw)

  // save these stats to the file system
  var filename = path.join(self.rawDir, raw.ts + '-' + hash + '.json')
  fs.writeFile(filename, JSON.stringify(raw), function(err) {
    if (err) {
      self.emit('err', err)
      return callback(err)
    }
    self.emit('stored')
    callback()
  })
}

StattoBackendFs.prototype.getRaws = function getRaws(date, callback) {
  var self = this
  callback = callback || noop

  date = self._datify(date)
  if ( !date ) {
    return process.nextTick(function() {
      callback(new Error('Unknown date type : ' + typeof date))
    })
  }
  var ts = date.toISOString()

  // get all of these raws from the filesystem
  glob(path.join(self.rawDir, ts + '-*.json'), function(err, files) {
    if (err) return callback(err)

    var raws = []
    async.eachSeries(
      files,
      function(filename, done) {
        if (err) return callback(err)
        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) return done(err)
          try {
            raws.push(JSON.parse(data))
          }
          catch (err) {
            return callback(err)
          }
          done()
        })
      },
      function(err) {
        if (err) return callback(err)
        callback(null, raws)
      }
    )
  })
}

StattoBackendFs.prototype.setStats = function setStats(stats, callback) {
  var self = this
  callback = callback || noop

  var ts = stats.ts

  // save these stats to the file system
  var filename = path.join(self.statsDir, stats.ts + '.json')
  fs.writeFile(filename, JSON.stringify(stats), function(err) {
    if (err) {
      self.emit('err', err)
      return callback(err)
    }
    self.emit('stored')
    callback()
  })
}

StattoBackendFs.prototype.getStats = function getStats(date, callback) {
  var self = this
  callback = callback || noop

  date = self._datify(date)
  if ( !date ) {
    return process.nextTick(function() {
      callback(new Error('Unknown date type : ' + typeof date))
    })
  }
  var ts = date.toISOString()

  var filename = path.join(self.statsDir, ts + '.json')
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) return callback(err)
    var stats
    try {
      stats = JSON.parse(data)
    }
    catch (err) {
      return callback(err)
    }
    callback(null, stats)
  })
}

StattoBackendFs.prototype.createStatsReadStream = function createStatsReadStream(from, to, callback) {
  // * from - greater than or equal to (always included)
  // * to - less than (therefore never included)
  var self = this

  from = self._datify(from)
  to   = self._datify(to)
  // if ( !from ) {
  //   return process.nextTick(function() {
  //     callback(new Error("Unknown 'from' type : " + typeof from))
  //   })
  // }
  // if ( !to ) {
  //   return process.nextTick(function() {
  //     callback(new Error("Unknown 'to' type : " + typeof to))
  //   })
  // }
  var ts1 = from.toISOString()
  var ts2 = to.toISOString()

  // let's loop through all the filenames, then load them up if it fits this range
  var stream = through()
  var filesToLoad = []

  // get all of the filenames from the filesystem
  glob(path.join(self.statsDir, '*.json'), function(err, filenames) {
    filenames = filenames.sort()
    var basename
    for (var i = 0; i < filenames.length; i++) {
      basename = path.basename(filenames[i], '.json')
      if ( basename >= ts1 && basename < ts2 ) {
        filesToLoad.push(filenames[i])
      }
    }

    async.eachSeries(
      filesToLoad,
      function(filename, done) {
        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) return done(err)
          var stats
          try {
            stats = JSON.parse(data)
          }
          catch (err) {
            return done(err)
          }
          stream.queue(stats)
          done()
        })
      },
      function(err) {
        if (err) return stream.emit('error', err)
        stream.emit('end')
        stream.emit('close')
      }
    )
  })

  return stream
}

// ToDo:
// * getCounterRange
// * getTimerRange
// * getGaugeRange

// --------------------------------------------------------------------------------------------------------------------

module.exports = function backend(dir, opts) {
  if ( !dir ) {
    throw new Error('Required: dir in statto-backend-fs')
  }

  return new StattoBackendFs(dir, opts)
}

// --------------------------------------------------------------------------------------------------------------------
