import { getLocalWaveData, getRemoteWaveData } from './server/library/waveformData.js'

const queryObject = {}

process.argv.forEach(function (value, index, array) {

    const commandParametersLength = array.length - 2

    if (commandParametersLength !== 7) {

        const error = 'invalid parameters length, please call the cli with the following parameters: node cli SERVER_PATH TRACK_NAME TRACK_EXTENSION AMOUT_OF_PEAKS LOCAL_OR_REMOTE_SERVICENAME PEAKSLIST_OUTPUT_FORMAT TRACK_FORMAT_DETECTION\n'

        process.stderr.write(error + "\n")

        process.exit(1)

    }

    if (index === 2) {
        queryObject.serverDirectory = value
    }

    if (index === 3) {
        queryObject.trackId = value
    }

    if (index === 4) {
        queryObject.trackFormat = value.toLowerCase()
    }

    if (index === 5) {
        queryObject.peaksAmount = parseInt(value)
    }

    if (index === 6) {
        queryObject.service = value.toLowerCase()
    }

    if (index === 7) {
        queryObject.outputFormat = value.toLowerCase()
    }

    if (index === 8) {

        if (typeof value === 'boolean') {
            queryObject.detectFormat = value
        } else {

            const detectFormat = value.toLowerCase()

            if (detectFormat === 'true') {
                queryObject.detectFormat = true
            } else if (detectFormat.substr(0, 2) === 'sr') {
                const splittedDetectFormat = detectFormat.split('=')
                queryObject.detectFormat = parseInt(splittedDetectFormat[1])
            } else {
                queryObject.detectFormat = false
            }

        }
    }
})

const outputResponse = function outputResponseFunction(error, peaks) {

    if (error) {
        process.stderr.write(error + "\n")
        process.exit(1)
    } else {

        let output = ''

        // outputFormat can be json or text
        if (queryObject.outputFormat === 'json') {

            const outputData = {
                "peaks": peaks
            }

            output = JSON.stringify(outputData)

        } else {

            const peaksString = ''
            let i
            const peaksLength = peaks.length

            for (i = 0; i < peaksLength; i++) {
                peaksString += peaks[i] + ','
            }

            output = peaksString.substring(0, peaksString.length - 1)

        }

        process.stdout.write(output + "\n")

        process.exit(0)

    }
}

if (queryObject.service === 'local') {
    getLocalWaveData(queryObject, outputResponse)
} else {
    getRemoteWaveData(queryObject, outputResponse)
}