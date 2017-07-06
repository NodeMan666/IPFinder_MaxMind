process.env.NODE_ENV = 'test'

var tape = require('tape')
var map = require('map-async')
var servertest = require('servertest')

var cities = require('./cities.json')
var server = require('../lib/server')()

tape('should get correct city info', function (t) {
  map(cities, getCityData, function (err) {
    t.ifError(err, 'should not error')
    t.end()
  })

  function getCityData (city, cb) {
    var opts = { encoding: 'json' }
    servertest(server, '/api/city?ip=' + city.ip, opts, function (err, res) {
      if (err) return cb(err)
      t.equal(res.statusCode, 200, 'correct statusCode')
      t.deepEqual(res.body, city.data, 'city should match')
      cb()
    })
  }
})

tape('should receive bad request error code', function (t) {
  servertest(server, '/api/city?ip=bad.ip', function (err, res) {
    t.ifError(err, 'should not error')
    t.equal(res.statusCode, 400, 'correct errorCode')
    t.end()
  })
})

tape('should receive not found error code', function (t) {
  servertest(server, '/api/city?ip=100.100.100.100', function (err, res) {
    t.ifError(err, 'should not error')
    t.equal(res.statusCode, 404, 'correct errorCode')
    t.end()
  })
})
