import AudioDataAnalyzer from './audioDataAnalyzer.js'
import FileDownloader from './fileDownloader.js'
import DirectoryManager from './directoryManager.js'
import FileManager from './fileManager.js'

const queryObjectToOptions = function queryObjectToOptionsFunction(queryObject) {

    const options = {
        trackId: queryObject.trackId,
        trackFormat: queryObject.trackFormat || 'ogg',
        peaksAmount: queryObject.peaksAmount || 200,
        method: 'GET',
        serverDirectory: queryObject.serverDirectory || './downloads',
        service: queryObject.service || 'jamendo',
        detectFormat: queryObject.detectFormat || false
    }

    options.fileName = options.trackId + '.' + options.trackFormat

    return options

}

const analyzeAudio = function analyzeAudioFunction(filePath, options, callback) {

    // initialize the audioAnalyzer
    const audioDataAnalyzer = new AudioDataAnalyzer()

    audioDataAnalyzer.setDetectFormat(options.detectFormat)

    // analyze the track using ffmpeg
    audioDataAnalyzer.getPeaks(filePath, options.peaksAmount, function getValuesCallback(error, peaks) {

        // if there was no error analyzing the track
        if (!error) {
            callback(null, peaks)
        } else {
            callback(error)
        }

    })

}

/**
 * 
 * get the wave data for a given trackId from a file on a remote server
 * 
 * @param {type} queryObject
 * @param {type} callback
 * @returns {undefined}
 */
const getRemoteWaveData = function getRemoteWaveDataFunction(queryObject, callback) {

    // track options
    const options = queryObjectToOptions(queryObject)

    if (typeof options.trackId !== 'undefined') {

        // service options
        switch (queryObject.service) {

            case 'jamendo':
            default:

                // track format
                switch (queryObject.trackFormat) {
                    case 'ogg':
                        // format code seems to have changed (as of 31.12.2022)
                        //options.formatCode = 'ogg1'
                        options.formatCode = 'ogg'
                        break
                    default:
                        options.formatCode = 'mp31'
                        // there also seems to be another format called mp32 but files seem to be identical
                        // example: https://prod-1.storage.jamendo.com/download/track/1886257/mp32/
                        //options.formatCode = 'mp32'
                }

                // old server seems to be gone (as of 31.12.2022)
                //options.remoteHost = 'storage-new.newjamendo.com'
                // new download server:
                options.remoteHost = 'prod-1.storage.jamendo.com'
                options.remotePath = '/download/track/' + options.trackId + '/' + options.formatCode

        }

        // initialize the track downloader
        const fileDownloader = new FileDownloader()

        // download the track and write it on the disc of it does not already exist
        fileDownloader.writeToDisc(options, function writeFileCallback(error, filePath) {

            // if there was no error downloading and writing the track
            if (!error) {
                analyzeAudio(filePath, options, callback)
            } else {
                callback(error)
            }

        })

    } else {
        callback('please specify at least a trackId')
    }

}

/**
 * 
 * get the wave data for a given trackId from a local file
 * 
 * @param {type} queryObject
 * @param {type} callback
 * @returns {undefined}
 */
const getLocalWaveData = function getLocalWaveDataFunction(queryObject, callback) {

    // track options
    const options = queryObjectToOptions(queryObject)

    const directoryManager = new DirectoryManager()

    directoryManager.exists(options.serverDirectory, function directoryExistsCallback(error, exists) {

        // if there was no error checking if the directory exists
        if (!error) {

            // if the directory does not exist
            if (!exists) {

                callback('the server directory does not exist')

            } else {

                const fileManager = new FileManager()

                const filePath = options.serverDirectory + '/' + options.fileName

                // check if the file exists
                fileManager.exists(filePath, function fileExistsCallback(error, exists) {

                    // if there was no error checking if the file exists
                    if (!error) {

                        if (!exists) {
                            callback('the file does not exist')
                        } else {
                            analyzeAudio(filePath, options, callback)
                        }

                    } else {
                        callback(error)
                    }

                })

            }

        } else {
            callback(error)
        }

    })

}

export { getRemoteWaveData, getLocalWaveData }