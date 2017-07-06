var request = require('request')
var fs = require('fs')
var maxmind = require('maxmind')
var targz = require('targz')
var path = require('path')
var fse = require('fs-extra')
var constants = require('../config/constants')

function getCityData (ip) {
  console.log('ip: ', ip)
  if (!maxmind.validate(ip)) {
    console.log('IP is invalid: ', ip)
    return { 'statusCode': 400 }
  }
  var cityLookUp = maxmind.openSync('./db/GeoIP2-City.mmdb', {
    cache: {
      max: 1000, // Max record count in cache
      maxAge: 1000 * 60 * 60 // Max length of lifecyle of cache
    },
    watchForUpdates: true // Automatically update GeoIP Database weekly
  })
  if (!cityLookUp) {
    console.log('Error loading mmdb')
    return { 'statusCode': 500 }
  }
  var cityObj = cityLookUp.get(ip)
  if (!cityObj || !cityObj.city) {
    return { 'statusCode': 404 }
  }

  return cityObj
}

function download (fileUrl, apiPath, callback) {
  console.log('Downloading maxmind database..')
  var timeout = 10000

  var file = fs.createWriteStream(apiPath)

  var timeoutWrapper = function (req) {
    return function () {
      console.log('abort')
      req.abort()
      callback('File transfer timeout!')
    }
  }

  var req = request.get(fileUrl).on('response', function (res) {
    res.on('data', function (chunk) {
      file.write(chunk)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(fn, timeout)
    }).on('end', function () {
            // clear timeout
      clearTimeout(timeoutId)
      file.end()
      console.log('File downloaded to: ' + apiPath)
      callback(null)
    }).on('error', function (err) {
            // clear timeout
      clearTimeout(timeoutId)
      callback(err.message)
    })
  })

    // generate timeout handler
  var fn = timeoutWrapper(req)

    // set initial timeout
  var timeoutId = setTimeout(fn, timeout)
}

function extractTargz (src, dest, cb) {
  console.log('Extracting Maxmind Database..')
  targz.decompress({
    src,
    dest
  }, function (err) {
    if (err) {
      console.log(err)
      return cb(err)
    } else {
      console.log('Extracting Completed!')
      return cb()
    }
  })
}

function moveFile (src, dest, cb) {
  console.log('Moving Maxmind DB')
  var glob = require('glob')
        // options is optional
  var options = {}
  glob(path.join(src, '/**/*.mmdb'), options, function (er, files) {
    fse.move(files[0], dest, err => {
      if (err) return console.error(err)
      console.log('Moving database success!')
      cb()
    })
  })
}

function checkAndCreateDB () {
  if (!fs.existsSync(constants.PATH_MAXMIND_DB)) {
    download(constants.URL_DOWNLOAD_MAXMIND_DB, constants.PATH_DOWNLOADED_TAR, function (err) {
      if (err) {
        console.error('Download failed due to error: ', err)
        return false
      }

      extractTargz(constants.PATH_DOWNLOADED_TAR, constants.PATH_DB, function (err) {
        if (err) {
          console.log('DB extracting failed due to error', err)
        }
        moveFile(constants.PATH_DB, constants.PATH_MAXMIND_DB, function (err) {
          if (err) { console.log('Moving failed due to error', err) }
        })
        return false
      })
    })
    return false
  }
  return true
}
module.exports = {
  getCityData,
  download,
  extractTargz,
  moveFile,
  checkAndCreateDB
}
