// --------------------------------------------------------------------------------------------------------------------
//
// statto-backend-fs/test/backend.js
// 
// Copyright 2015 Tynio Ltd.
//
// --------------------------------------------------------------------------------------------------------------------

// npm
var test = require('tape')
var stattoBackendTest = require('statto-backend/test/backend.js')

// local
var stattoBackendFs = require('../')

// --------------------------------------------------------------------------------------------------------------------

// create a backend
var backend = stattoBackendFs('store')

backend.setup(function() {
  // now run the tests
  stattoBackendTest(backend, test)
})

// --------------------------------------------------------------------------------------------------------------------
