# How to install/run

You just need to run "npm install/npm start", then this app would perform necessary actions(downloading maxmind db, extracting it, moving it into correct directory) automatically.

# How to test

Please run "npm test", then test cases would be processed and you can see result of the test.

# Geo

HTTP API to look up geo information by IP. Uses [maxmind](http://maxmind.com).

## Project

This service:

* Will run an HTTP API via `npm start` and will listen on `process.env.PORT || 5000` (see [index.js](https://gist.github.com/davidguttman/199f92c51729301af0a2945e755a6c1d#file-index-js))

* Will be well tested using [servertest](http://npm.im/servertest) via `npm test`.

* Will conform to [standard JS style](http://standardjs.com/)

* Will only use callbacks (no promises).

* Will use the core `http` module (no express).

* Will have a health check endpoint at `/health` using [healthpoint](http://npm.im/healthpoint) -- check to see if the maxmind database is downloaded and ready to provide data.

* Log all requests except `/health` using [req-logger](https://www.npmjs.com/package/req-logger)

* Will be accessible via CORS (see [corsify](http://npm.im/corsify))

* Will download the IP database (gzipped tar file) from Maxmind using this url: `https://download.maxmind.com/app/geoip_download?edition_id=GeoIP2-City&suffix=tar.gz&license_key=uzrU0s2GJt6I`

* Will redownload/refresh the db to ensure that the data is never more than one week old.

## Endpoints

### `/api/city`

Returns information about an IP address using the above database and the [maxmind module](http://npm.im/maxmind). *If no IP address is provided, return information about the requestor's IP.*

Example:

```
GET /api/city?ip=66.6.44.4

{
  "ip": "66.6.44.4",
  "city": {
    "geoname_id": 5128581,
    "names": {
      "de": "New York City",
      "en": "New York",
      "es": "Nueva York",
      "fr": "New York",
      "ja": "ニューヨーク",
      "pt-BR": "Nova Iorque",
      "ru": "Нью-Йорк",
      "zh-CN": "纽约"
    }
  },
  "continent": {
    "code": "NA",
    "geoname_id": 6255149,
    "names": {
      "de": "Nordamerika",
      "en": "North America",
      "es": "Norteamérica",
      "fr": "Amérique du Nord",
      "ja": "北アメリカ",
      "pt-BR": "América do Norte",
      "ru": "Северная Америка",
      "zh-CN": "北美洲"
    }
  },
  "country": {
    "geoname_id": 6252001,
    "iso_code": "US",
    "names": {
      "de": "USA",
      "en": "United States",
      "es": "Estados Unidos",
      "fr": "États-Unis",
      "ja": "アメリカ合衆国",
      "pt-BR": "Estados Unidos",
      "ru": "США",
      "zh-CN": "美国"
    }
  },
  "location": {
    "accuracy_radius": 1000,
    "latitude": 40.7391,
    "longitude": -73.9826,
    "metro_code": 501,
    "time_zone": "America/New_York"
  },
  "postal": {
    "code": "10010"
  },
  "registered_country": {
    "geoname_id": 6252001,
    "iso_code": "US",
    "names": {
      "de": "USA",
      "en": "United States",
      "es": "Estados Unidos",
      "fr": "États-Unis",
      "ja": "アメリカ合衆国",
      "pt-BR": "Estados Unidos",
      "ru": "США",
      "zh-CN": "美国"
    }
  },
  "subdivisions": [
    {
      "geoname_id": 5128638,
      "iso_code": "NY",
      "names": {
        "de": "New York",
        "en": "New York",
        "es": "Nueva York",
        "fr": "New York",
        "ja": "ニューヨーク州",
        "pt-BR": "Nova Iorque",
        "ru": "Нью-Йорк",
        "zh-CN": "纽约州"
      }
    }
  ]
}
```
