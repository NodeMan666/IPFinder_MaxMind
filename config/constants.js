var path = require('path')
module.exports = {
  PATH_MAXMIND_DB: path.join(__dirname, '/../db/GeoIP2-City.mmdb'),
  URL_DOWNLOAD_MAXMIND_DB: 'https://download.maxmind.com/app/geoip_download?edition_id=GeoIP2-City&suffix=tar.gz&license_key=uzrU0s2GJt6I',
  PATH_DOWNLOADED_TAR: path.join(__dirname, '/../db/temp/temp.tar.gz'),
  PATH_DB: path.join(__dirname, '/../db/temp/')
}
