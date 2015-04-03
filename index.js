// --------------------------------------------------------------------------------------------------------------------
//
// statto-backend-leveldb/index.js
// 
// Copyright 2015 Tynio Ltd.
//
// --------------------------------------------------------------------------------------------------------------------

// core
var events = require('events')
var path = require('path')
var util = require('util')
var crypto = require('crypto')

// npm
var fs = require('graceful-fs')
var async = require('async')
var mkdirp = require('mkdirp')
var stattoMerge = require('statto-merge')
var stattoProcess = require('statto-process')

// --------------------------------------------------------------------------------------------------------------------

function StattoBackendFs(dir, opts) {
  if ( !dir ) {
    throw new Error('Provide a dir')
  }

  // default the opts to nothing
  this.dir      = dir
  this.opts     = opts || {}
}

util.inherits(StattoBackendFs, events.EventEmitter);

StattoBackendFs.prototype.setup = function setup(callback) {
  var self = this

  // make sure this directory exists
  mkdirp(self.dir, callback)
}

StattoBackendFs.prototype.stats = function stats(stats) {
  var self = this

  // create a unique filename, use the hash of the contents
  var str = JSON.stringify(stats)
  var hash = crypto.createHash('sha1').update(str).digest('hex')

  // save these stats to the file system
  var filename = path.join(self.dir, stats.ts + '-' + hash + '.json')
  fs.writeFile(filename, JSON.stringify(stats), function(err) {
    if (err) return self.emit('err', err)
  })
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
