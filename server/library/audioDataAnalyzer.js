import { spawn as childProcessSpawn } from 'child_process'
//import util from 'util'

/**
 * 
 * audio data analyzer
 *
 * credits: inspired by https://github.com/jhurliman/node-pcm
 *
 */

class AudioDataAnalyzer {

    constructor() {

        this.stdoutFfprobeOuputString = ''
        this.stderrFfprobeOuputString = ''

        this.stderrFfmpgegOuputString = ''

        this.samples = []
        this.peaksInPercent = []

        this.trackData = {}

        this.detectFormat = false

        this.logMemory = false

    }

    /**
     *
     * printMemory
     *
     * @param {type} options
     *
     * @returns {undefined}
     */
    printMemory(options) {

        if (this.logMemory) {
            const memoryData = process.memoryUsage()
            console.log('rss: ' + memoryData.rss / 1000000 + ', heapTotal: ' + memoryData.heapTotal / 1000000 + ', heapUsed: ' + memoryData.heapUsed / 1000000 + ', options: ' + JSON.stringify(options))
        }

    }

    /**
     *
     * set detect format option
     *
     * @param {type} detectFormat
     * @returns {undefined}
     */
    setDetectFormat(detectFormat) {
        this.detectFormat = detectFormat
    }

    /**
     *
     * get detect format option
     *
     * @returns {undefined}
     */
    getDetectFormat() {
        return this.detectFormat
    }

    /**
     *
     * get track format using ffprobe (channels, samplerate, ...)
     *
     * @param {type} trackPath
     * @param {type} callback
     * @returns {undefined}
     */
    getFormat(trackPath, callback) {

        if (this.detectFormat === true) {

            const that = this

            // ffprobe file data
            const ffprobeSpawn = childProcessSpawn(
                'ffprobe',
                [
                    trackPath,
                    '-v',
                    'quiet',
                    '-show_streams',
                    '-show_format',
                    '-print_format',
                    'json'
                ]
            )

            ffprobeSpawn.stdout.setEncoding('utf8')
            ffprobeSpawn.stderr.setEncoding('utf8')

            // ffprobe recieves data on stdout
            ffprobeSpawn.stdout.on('data', function (data) {

                that.stdoutFfprobeOuputString += data

            })

            ffprobeSpawn.stdout.on('end', function (data) {

                if (that.stdoutFfprobeOuputString !== '') {

                    // parse the ffprobe json string response
                    const stdoutOuput = JSON.parse(that.stdoutFfprobeOuputString)

                    if (Object.keys(stdoutOuput).length > 0) {

                        // create a trackdata object with the informations we need
                        that.trackData.duration = stdoutOuput['format']['duration']
                        that.trackData.size = stdoutOuput['format']['size']
                        that.trackData.bitRate = stdoutOuput['format']['bit_rate']
                        that.trackData.sampleRate = stdoutOuput['streams'][0]['sample_rate']
                        that.trackData.channels = stdoutOuput['streams'][0]['channels']

                    }

                }

            })

            ffprobeSpawn.stderr.on('data', function (data) {
                that.stderrFfprobeOuputString += data
            })

            ffprobeSpawn.stderr.on('end', function () {
                //console.log('ffprobeSpawn stderr end')
            })

            ffprobeSpawn.on('exit', function (code) {

                // if the code is an error code
                if (code > 0) {

                    if (that.stderrFfprobeOuputString === '') {
                        that.stderrFfprobeOuputString = 'unknown ffprobe error'
                    }

                    callback(that.stderrFfprobeOuputString)

                } else {

                    // if the trackdata object isnt empty
                    if (Object.keys(that.trackData).length > 0) {
                        callback(null, that.trackData)
                    } else {
                        callback('ffprobe did not output any data')
                    }

                }
            })

            ffprobeSpawn.on('close', function () {
                //console.log('ffprobeSpawn close')
            })

            ffprobeSpawn.on('error', function (error) {

                if (error.code === 'ENOENT') {
                    callback('Unable to locate ffprobe, check it is installed and in the path')
                } else {
                    callback(error.syscall + ' ' + error.errno)
                }

            })

        } else {
            callback(null, this.trackData)
        }

    }

    /**
     *
     * get pcm data of a track
     *
     * @param {type} trackPath
     * @param {type} peaksAmountRaw
     * @param {type} callback
     * @returns {undefined}
     */
    getPeaks(trackPath, peaksAmountRaw, callback) {

        const that = this

        this.printMemory({ 'file': 'audioDataAnalyzer', 'line': '242' })

        this.getFormat(trackPath, function (error, trackData) {

            let peaksAmount

            if (!error) {

                if (peaksAmountRaw !== undefined) {
                    peaksAmount = parseInt(peaksAmountRaw)
                } else {
                    callback('peaksAmount is undefined')
                }

                that.printMemory({ 'file': 'audioDataAnalyzer', 'line': '258' })

                if (Object.keys(trackData).length === 0 && trackData.constructor === Object) {

                    if (typeof that.detectFormat === 'number') {
                        trackData.sampleRate = that.detectFormat
                    } else {
                        trackData.sampleRate = 44100
                    }

                    trackData.channels = 1

                }

                // get audio pcm as 16bit little endians
                const ffmpegSpawn = childProcessSpawn(
                    'ffmpeg',
                    [
                        '-i',
                        trackPath,
                        '-f',
                        's16le',
                        '-ac',
                        trackData.channels,
                        '-acodec',
                        'pcm_s16le',
                        '-ar',
                        trackData.sampleRate,
                        '-y',
                        'pipe:1' // pipe to stdout
                    ]
                )

                //ffmpegSpawn.stdout.setEncoding('utf8')

                ffmpegSpawn.stderr.setEncoding('utf8')

                ffmpegSpawn.stdout.on('data', function (buffer) {
                    // each buffer contains a certain amount of bytes (8bit)
                    // https://trac.ffmpeg.org/wiki/audio%20types

                    // and we convert them to signed 16-bit little endians
                    // http://nodejs.org/api/buffer.html#buffer_buf_readint16le_offset_noassert
                    that.printMemory({ 'file': 'audioDataAnalyzer', 'line': '299' })

                    let i
                    const dataLen = buffer.length

                    // each buffer data contains 8bit but we read 16bit so i += 2
                    for (i = 0; i < dataLen; i += 2) {

                        const positiveSample = Math.abs(buffer.readInt16LE(i, false))

                        that.samples.push(positiveSample)

                    }

                    that.printMemory({ 'file': 'audioDataAnalyzer', 'line': '313' })

                })

                ffmpegSpawn.stdout.on('end', function (data) {

                    const samplesLength = that.samples.length

                    // check if we got enough samples to put at least one sample
                    // into each peak
                    if (samplesLength > peaksAmount) {

                        // calculate how much samples we have to put into one peak
                        const samplesCountPerPeak = Math.floor(samplesLength / peaksAmount)
                        const peaks = []

                        let i
                        let start = 0
                        let end = start + samplesCountPerPeak
                        let highestPeak = 0

                        that.printMemory({ 'file': 'audioDataAnalyzer', 'line': '336' })

                        // build as much peaks as got requested
                        for (i = 0; i < peaksAmount; i++) {

                            // get a series of samples collection
                            const peaksGroup = that.samples.slice(start, end)
                            let x
                            let samplesSum = 0
                            const peaksGroupLength = peaksGroup.length

                            // merge the samples into a single peak
                            for (x = 0; x < peaksGroupLength; x++) {

                                samplesSum += peaksGroup[x]

                            }

                            peaks.push(samplesSum)

                            // find the highest peak
                            if (samplesSum > highestPeak) {
                                highestPeak = samplesSum
                            }

                            start += samplesCountPerPeak
                            end += samplesCountPerPeak

                        }

                        that.printMemory({ 'file': 'audioDataAnalyzer', 'line': '368' })

                        let y
                        const peaksLength = peaks.length

                        // convert the peaks into percantage values
                        for (y = 0; y < peaksLength; y++) {
                            const peakInPercent = Math.round((peaks[y] / highestPeak) * 100)
                            that.peaksInPercent.push(peakInPercent)
                        }

                        that.printMemory({ 'file': 'audioDataAnalyzer', 'line': '382' })

                    }

                })

                ffmpegSpawn.stderr.on('data', function (data) {
                    that.stderrFfprobeOuputString += data
                })

                ffmpegSpawn.stderr.on('end', function () {
                    //console.log('ffmpegSpawn stderr end')
                })

                ffmpegSpawn.on('exit', function (code) {

                    // under heavy load it seems that sometimes ffmpegSpawn.on('exit') gets called 
                    // before ffmpegSpawn.stdout.on('end') got called
                    // so we now wait 200ms before trying to read the peaks
                    setTimeout(function () {

                        if (code > 0) {

                            if (that.stderrFfmpegOuputString === '') {
                                that.stderrFfmpegOuputString = 'unknown ffmpeg error'
                            }

                            callback(that.stderrFfmpegOuputString)

                        } else {

                            const peaksInPercentLength = that.peaksInPercent.length

                            if (peaksInPercentLength > 0) {
                                callback(null, that.peaksInPercent)
                            } else {

                                const samplesLength = that.samples.length

                                if (samplesLength === 0) {
                                    callback('no output recieved')
                                } else if (samplesLength < peaksAmount) {
                                    callback('not enough peaks in this song for a full wave')
                                }

                            }

                        }

                    }, 200)

                })

                ffmpegSpawn.on('close', function () {
                    //console.log('ffmpegSpawn close')
                })

                ffmpegSpawn.on('error', function (error) {

                    if (error.code === 'ENOENT') {
                        callback('Unable to locate ffmpeg, check it is installed and in the path')
                    } else {
                        callback(error.syscall + ' ' + error.errno)
                    }

                })

            } else {

                callback(error)

            }

        })

    }
}

export default AudioDataAnalyzer