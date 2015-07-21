Q = require 'q'
request = require 'request'
fs = require 'fs'
path = require 'path'
fileManager = require './file-manager'

class AppPublisher
  publish: (app, version, vendor, credentials) =>
    console.log "Publishing", "#{app}", "#{version}"
    @pushApp(app, version, vendor, credentials)

  pushApp: (app, version, vendor, credentials) =>
    console.log "Compressing files...".grey
    fileManager.compressFiles(app, version).then =>
      fileManager.getRequestConfig().then (config) =>
        deferred = Q.defer()
        url = config.GalleryEndpoint or "http://api.beta.vtex.com"
        acceptHeader = config.AcceptHeader or "application/vnd.vtex.gallery.v0+json"
        formData =
          attachments: [
            fs.createReadStream(fileManager.getZipFilePath(app, version))
          ]

        options =
          url: "#{url}/#{vendor}/apps"
          method: 'POST'
          formData: formData
          headers: {
            Authorization : 'token ' + credentials.token
            'Accept' : acceptHeader
            'x-vtex-accept-snapshot' : false
          }

        console.log "Sending files...".grey
        request(options, (error, response) =>
          if error
            return deferred.reject(error)

          fileManager.removeZipFile(app, version)

          if response.statusCode in [200, 201]
            deferred.resolve({app: app, version: version})
          else
            deferred.reject({status: response.statusCode, body: response.body})
        )

        deferred.promise

appPublisher = new AppPublisher()
module.exports =
  publish: appPublisher.publish
