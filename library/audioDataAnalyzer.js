
// nodejs child_process
var childProcessSpawn = require('child_process').spawn;

/**
 * 
 * analyzer constructor
 * 
 * @returns {analyzerConstructor}
 */
var analyzer = function analyzerConstructor() {
    
};

/**
 * 
 * get track data using ffprobe (channels, samplerate, ...)
 * 
 * @param {type} trackPath
 * @param {type} callback
 * @returns {undefined}
 */
analyzer.prototype.getData = function getDataFunction(trackPath, callback) {
    
    var stdoutOuputString = '';
    var stderrOuputString = '';
    
    var trackData = {};
    
    //console.log(trackPath);
    
    // ffprobe file data
    var ffprobeSpawn = childProcessSpawn(
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
    );
    
    //ffprobeSpawn.stdout.setEncoding('utf8');
    ffprobeSpawn.stderr.setEncoding('utf8');

    // ffprobe recieves data on stdout
    ffprobeSpawn.stdout.on('data', function(data) {

        stdoutOuputString += data;
        
    });

    ffprobeSpawn.stdout.on('end', function(data) {

        //console.log('ffprobeSpawn stdout end');
        //console.log(stdoutOuputString);

        if (stdoutOuputString !== '') {

            // parse the ffprobe json string response
            var stdoutOuput = JSON.parse(stdoutOuputString);
            
            //console.log(stdoutOuput);
            //console.log(Object.keys(stdoutOuput).length);
            
            if (Object.keys(stdoutOuput).length > 0) {

                // create a trackdata object with the informations we need
                trackData.duration = stdoutOuput['format']['duration'];
                trackData.size = stdoutOuput['format']['size'];
                trackData.bitRate = stdoutOuput['format']['bit_rate'];
                trackData.sampleRate = stdoutOuput['streams'][0]['sample_rate'];
                trackData.channels = stdoutOuput['streams'][0]['channels'];
                
            }
            
            //console.log(trackData);

        }

    });

    ffprobeSpawn.stderr.on('data', function(data) {

        stderrOuputString += data;

    });

    ffprobeSpawn.stderr.on('end', function() {

        //console.log('ffprobeSpawn stderr end');

    });

    ffprobeSpawn.on('exit', function(code) {

        //console.log('ffprobeSpawn exit, code: ' + code);
        
        // if the code is an error code
        if (code > 0) {
            
            if (stderrOuputString === '') {
                
                stderrOuputString = 'unknown ffprobe error';
                
            }
            
            callback(stderrOuputString);
            
        } else {
            
            //console.log(trackData);
            //console.log(Object.keys(trackData).length);
            
            // if the trackdata object isnt empty
            if (Object.keys(trackData).length > 0) {
                
                callback(false, trackData);
                
            } else {
                
                //console.log('ffprobe did not output any data');
                
                callback('ffprobe did not output any data');
                
            }
            
        }

    });

    ffprobeSpawn.on('close', function() {

        //console.log('ffprobeSpawn close');

    });
    
    ffprobeSpawn.on('error', function(error) {

        if (error.code === 'ENOENT') {

            callback('Unable to locate ffprobe, check it is installed and in the path');
            
        } else {
            
            callback(error.syscall + ' ' + error.errno);
            
        }

    });
    
};

/**
 * 
 * get pcm data of a track
 * 
 * @param {type} trackPath
 * @param {type} peaksAmountRaw
 * @param {type} callback
 * @returns {undefined}
 */
analyzer.prototype.getPeaks = function getValuesFunction(trackPath, peaksAmountRaw, callback) {
    
    this.getData(trackPath, function(error, trackData) {

        if (!error) {
            
            if (peaksAmountRaw !== undefined) {
            
                var peaksAmount = parseInt(peaksAmountRaw);
                
            } else {
                
                callback('peaksAmount is undefined');
                
            }
            
            // get audio pcm as 16bit little endians
            var ffmpegSpawn = childProcessSpawn(
                'ffmpeg',
                [
                    '-i',
                    trackPath,
                    '-f',
                    's16le',
                    '-ac',
                    //trackData.channels,
                    // put everything into one channel
                    1,
                    '-acodec',
                    'pcm_s16le',
                    '-ar',
                    trackData.sampleRate,
                    '-y',
                    'pipe:1' // pipe to stdout
                ]
            );

            var stdoutOuputString = '';
            var stderrOuputString = '';
            
            //ffmpegSpawn.stdout.setEncoding('utf8');
            ffmpegSpawn.stderr.setEncoding('utf8');
            
            var samples = [];

            ffmpegSpawn.stdout.on('data', function(buffer) {
                
                // each buffer contains a certain amount of bytes (8bit)
                // https://trac.ffmpeg.org/wiki/audio%20types

                // and we convert them to signed 16-bit little endians
                // http://nodejs.org/api/buffer.html#buffer_buf_readint16le_offset_noassert
                
                
                var i;
                var dataLen = buffer.length;
                
                // each buffer data contains 8bit but we read 16bit so i += 2
                for (i = 0; i < dataLen; i += 2) {

                    var positiveSample = Math.abs(buffer.readInt16LE(i, false));

                    samples.push(positiveSample);

                }

            });

            ffmpegSpawn.stdout.on('end', function(data) {

                //console.log('ffmpegSpawn stdout end');
                
                var samplesLength = samples.length;

                // check if we got enough samples to put at least one sample
                // into each peak
                if (samplesLength > peaksAmount) {

                    // calculate how much samples we have to put into one peak
                    var samplesCountPerPeak = Math.floor(samplesLength / peaksAmount);
                    var peaks = [];
                    var peaksInPercent = [];

                    var i;
                    var start = 0;
                    var end = start + samplesCountPerPeak;
                    var highestPeak = 0;

                    // build as much peaks as got requested
                    for (i = 0; i < peaksAmount; i++) {
                        
                        // get a series of samples collection
                        var peaksGroup = samples.slice(start, end);
                        var x;
                        var samplesSum = 0;
                        var peaksGroupLength = peaksGroup.length;

                        // merge the samples into a single peak
                        for (x = 0; x < peaksGroupLength; x++) {

                            samplesSum += peaksGroup[x];

                        }

                        peaks.push(samplesSum);
                        
                        // find the highest peak
                        if (samplesSum > highestPeak) {
                            
                            highestPeak = samplesSum;
                            
                        }

                        start += samplesCountPerPeak;
                        end += samplesCountPerPeak;

                    }
                    
                    var y;
                    var peaksLength = peaks.length;

                    // convert the peaks into percantage values
                    for (y = 0; y < peaksLength; y++) {

                        var peakInPercent = Math.round((peaks[y] / highestPeak) * 100);

                        peaksInPercent.push(peakInPercent);

                    }

                    callback(false, peaksInPercent);

                } else {
                    
                    if (samplesLength === 0) {

                        callback('no output recieved');
                        
                    } else if (samplesLength < peaksAmount) {
                        
                        callback('not enough peaks in this song for a full wave');
                        
                    }

                }

            });

            ffmpegSpawn.stderr.on('data', function(data) {

                //console.log(data.toString());

            });

            ffmpegSpawn.stderr.on('end', function() {

                //console.log('ffmpegSpawn stderr end');

            });

            ffmpegSpawn.on('exit', function(code) {

                //console.log('ffmpegSpawn exit, code: ' + code);

            });

            ffmpegSpawn.on('close', function() {

                //console.log('ffmpegSpawn close');

            });
            
            ffmpegSpawn.on('error', function(error) {

                if (error.code === 'ENOENT') {

                    callback('Unable to locate ffmpeg, check it is installed and in the path');

                } else {

                    callback(error.syscall + ' ' + error.errno);

                }

            });
            
        } else {
            
            callback(error);
            
        }
        
    });
    
};

module.exports.analyzer = analyzer;