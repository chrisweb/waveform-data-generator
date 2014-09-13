
// nodejs child_process
var childProcess = require('child_process');

/**
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
    
    // ffprobe file data
    var ffprobeSpawn = childProcess.spawn(
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

    var stdoutOuputString = '';
    var stderrOuputString = '';

    ffprobeSpawn.stdout.on('data', function(data) {

        stdoutOuputString += data;
        
    });
    
    var trackData = {};

    ffprobeSpawn.stdout.on('end', function(data) {

        console.log('ffprobeSpawn stdout end');

        if (stdoutOuputString !== '') {

            console.log('stdoutOuput');
            //console.log(stdoutOuputString);
            
            var stdoutOuput = JSON.parse(stdoutOuputString);

            trackData.duration = stdoutOuput['format']['duration'];
            trackData.size = stdoutOuput['format']['size'];
            trackData.bitRate = stdoutOuput['format']['bit_rate'];
            trackData.sampleRate = stdoutOuput['streams'][0]['sample_rate'];
            trackData.channels = stdoutOuput['streams'][0]['channels'];

        }

    });

    ffprobeSpawn.stderr.setEncoding('utf8');

    ffprobeSpawn.stderr.on('data', function(data) {

        stderrOuputString += data;

    });

    ffprobeSpawn.stderr.on('end', function() {

        console.log('ffprobeSpawn stderr end');

    });

    ffprobeSpawn.on('exit', function(code) {

        console.log('ffprobeSpawn exit, code: ' + code);
        
        if (code > 0) {
            
            callback(stderrOuputString);
            
        } else {
            
            if (Object.keys(trackData).length > 0) {
                
                callback(false, trackData);
                
            } else {
                
                callback('ffprobe did not output any data');
                
            }
            
        }

    });

    ffprobeSpawn.on('close', function() {

        console.log('ffprobeSpawn close');

    });
    
};

/**
 * 
 * get pcm data of a track
 * 
 * @param {type} trackPath
 * @param {type} callback
 * @returns {undefined}
 */
analyzer.prototype.getPeaks = function getValuesFunction(trackPath, peaksAmountRaw, callback) {
    
    this.getData(trackPath, function(error, trackData) {

        if (!error) {
            
            console.log('ffprobe track data: ');
            console.log(trackData);
            
            var peaksAmount = parseInt(peaksAmountRaw);
            
            // get audio pcm as 16bit little endians
            var ffmpegSpawn = childProcess.spawn(
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

                console.log('ffmpegSpawn stdout end');
                
                var samplesLength = samples.length;

                if (samplesLength > peaksAmount) {

                    var samplesCountPerPeak = Math.floor(samplesLength / peaksAmount);
                    var peaks = [];
                    var peaksInPercent = [];

                    var i;
                    var start = 0;
                    var end = start + samplesCountPerPeak;
                    var highestPeak = 0;

                    for (i = 0; i < peaksAmount; i++) {
                        
                        var peaksGroup = samples.slice(start, end);
                        var x;
                        var samplesSum = 0;
                        var peaksGroupLength = peaksGroup.length;

                        for (x = 0; x < peaksGroupLength; x++) {

                            samplesSum += peaksGroup[x];

                        }

                        peaks.push(samplesSum);
                        
                        if (samplesSum > highestPeak) {
                            
                            highestPeak = samplesSum;
                            
                        }

                        start += samplesCountPerPeak;
                        end += samplesCountPerPeak;

                    }
                    
                    var y;
                    var peaksLength = peaks.length;

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

            ffmpegSpawn.stderr.setEncoding('utf8');

            ffmpegSpawn.stderr.on('data', function(data) {

                //console.log(data.toString());

            });

            ffmpegSpawn.stderr.on('end', function() {

                console.log('ffmpegSpawn stderr end');

            });

            ffmpegSpawn.on('exit', function(code) {

                console.log('ffmpegSpawn exit, code: ' + code);

            });

            ffmpegSpawn.on('close', function() {

                console.log('ffmpegSpawn close');

            });
            
        } else {
            
            callback(error);
            
        }
        
    });
    
};

module.exports.analyzer = analyzer;