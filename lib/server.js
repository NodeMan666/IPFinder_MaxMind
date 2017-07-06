var http = require('http')
var fs = require('fs')
var Url = require('url')
var healthpoint = require('healthpoint')
var ReqLogger = require('req-logger')
var Corsify = require('corsify')
var mmdbClient = require('./mmdb-client')
var constants = require('../config/constants')
var appVersion = require('../package.json').version

var logger = ReqLogger({
  version: appVersion
})

var hp = healthpoint({
  version: appVersion
}, function (cb) {
  fs.access(constants.PATH_MAXMIND_DB, function (err) {
    var dbError = null
    if (err) {
      console.log('Error: No Access to Geo DB', err)
      dbError = new Error(err)
    }
    cb(dbError)
  })
})

var cors = Corsify({
  'Access-Control-Allow-Methods': 'GET'
})

function requestHandler (req, res) {
  var urlObj = Url.parse(req.url, true)
  if (urlObj.pathname === '/health') {
    return hp(req, res)
  }

  logger(req, res, {
    timestamp: new Date()
  })
  if (req.method === 'GET' && urlObj.pathname === '/api/city') {
    if (!mmdbClient.checkAndCreateDB()) {
      res.statusCode = 500
      return res.end()
    }

    var ip = urlObj.query.ip || ((req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress)
    var cityObj = mmdbClient.getCityData(ip)
    if (cityObj && cityObj.city) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(cityObj))
    } else {
      res.statusCode = cityObj.statusCode
      return res.end()
    }
  } else if (req.method === 'GET' && urlObj.pathname === '/api/download') {
    mmdbClient.download(constants.URL_DOWNLOAD_MAXMIND_DB, constants.PATH_DOWNLOADED_TAR, function (err) {
      if (err) {
        console.error('Download failed due to error: ', err)
        res.statusCode = 500
        return res.end()
      }
      res.statusCode = 200
      res.end()
    })
  } else if (req.method === 'GET' && urlObj.pathname === '/api/extract') {
    mmdbClient.extractTargz(constants.PATH_DOWNLOADED_TAR, constants.PATH_DB, function (err) {
      if (err) {
        console.log('Extract failed due to error: ', err)
        res.statusCode = 500
        return res.end()
      }
      res.statusCode = 200
      return res.end()
    })
  } else if (req.method === 'GET' && urlObj.pathname === '/api/movefile') {
    mmdbClient.moveFile(constants.PATH_DB, constants.PATH_MAXMIND_DB, function (err) {
      if (err) {
        console.log('Moving file failed due to error: ', err)
        res.statusCode = 500
        return res.end()
      }
      res.statusCode = 200
      return res.end()
    })
  } else {
    res.statusCode = 400
    res.end()
  }
}

function createServer () {
  return http.createServer(cors(function (req, res) {
    req.on('error', function (err) {
      console.error(err)
      res.statusCode = 400
      res.end()
    })
    res.on('error', function (err) {
      console.error(err)
    })
    requestHandler(req, res)
  }))
}

module.exports = createServer
