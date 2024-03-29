import { createWriteStream } from 'fs'
import { request } from 'https'
import DirectoryManager from './directoryManager.js'
import FileManager from './fileManager.js'

class FileDownloader {

    constructor() {
    }

    /**
     *
     * fetches a file from a remote server and writes it into a folder on disc
     *
     * @param {type} options
     * @param {type} callback
     * @returns {undefined}
     */
    writeToDisc(options, callback) {

        //console.log(options)

        if (options === undefined) {
            options = {}
        }

        const directoryManager = new DirectoryManager()

        const that = this

        // check if the temporary tracks directory already exists
        directoryManager.exists(options.serverDirectory, function directoryExistsCallback(error, exists) {

            // if there was no error checking if the directory exists
            if (!error) {

                // if the directory does not exist
                if (!exists) {

                    // create a new directory
                    directoryManager.create(options.serverDirectory, createDirectoryCallback = function (error) {

                        // if there was no error creating the new directory
                        if (!error) {
                            // download the the track and store it on disc
                            that.downloadIfNotExists(options, callback)
                        } else {
                            callback(error)
                        }

                    })

                } else {
                    // download the the track and store it on disc
                    that.downloadIfNotExists(options, callback)
                }

            } else {
                callback(error)
            }

        })

    }
    /**
     *
     * donwloads a track if does not already exist on disc
     *
     * @param {type} options
     * @param {type} callback
     * @returns {undefined}
     */
    downloadIfNotExists(options, callback) {

        const fileManager = new FileManager()
        const filePath = options.serverDirectory + '/' + options.fileName
        const that = this

        // check if the file already exists
        fileManager.exists(filePath, function fileExistsCallback(error, exists) {

            // if there was no error checking if the file exists
            if (!error) {

                if (!exists) {
                    // download the file and store it in the temporary directory
                    that.downloadFile(options, callback)
                } else {
                    callback(null, filePath)
                }

            } else {
                callback(error)
            }

        })

    }
    /**
     *
     * download a file
     *
     * @param {type} downloadOptions
     * @param {type} callback
     * @returns {undefined}
     */
    downloadFile(downloadOptions, callback) {

        //console.log('downloadFile: ' + downloadOptions.fileName)

        if (downloadOptions === undefined) {
            callback('downloadOptions is undefined')
        }

        if (downloadOptions.method === undefined) {
            downloadOptions.method = 'GET'
        }

        if (downloadOptions.remotePort === undefined) {
            downloadOptions.remotePort = 443
        }

        if (downloadOptions.remoteHost === undefined) {
            callback('download host is undefined')
        }

        if (downloadOptions.remotePath === undefined) {
            callback('download path is undefined')
        }

        // the file path on the server
        const serverFilePath = downloadOptions.serverDirectory + '/' + downloadOptions.fileName

        // create a write stream
        const writeStream = createWriteStream(serverFilePath)

        // open a new write stream
        writeStream.on('open', function () {

            const requestOptions = {
                hostname: downloadOptions.remoteHost,
                port: downloadOptions.remotePort,
                path: downloadOptions.remotePath,
                method: downloadOptions.method
            }

            //console.log(requestOptions)

            // request the file from remote server
            const httpRequest = request(requestOptions, function (httpResponse) {

                //console.log('writeTrackToDisc httpRequest STATUS: ' + httpResponse.statusCode)
                //console.log('writeTrackToDisc httpRequest HEADERS: ' + JSON.stringify(httpResponse.headers))

                // on successful request
                httpResponse.on('data', function (chunk) {
                    // write the file
                    writeStream.write(chunk)
                })

                // the connection got closed
                httpResponse.on('end', function () {

                    //console.log('remote file: ' + downloadOptions.fileName + ', got downloaded into: ' + downloadOptions.serverDirectory)

                    // close the write stream
                    writeStream.end()

                    callback(null, serverFilePath)
                })

            })

            // the request to the remote server failed
            httpRequest.on('error', function (error) {

                //console.log('writeToDisc, http request error: ' + error.message)

                writeStream.end()

                callback(error)
            })

            httpRequest.end()
        })

        // writing the file failed
        writeStream.on('error', function (error) {

            //console.log('writeToDisc writeStream, error: ' + error)

            // close the stream
            writeStream.end()

            callback(error)
        })

    }
}

export default FileDownloader