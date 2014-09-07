
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
analyzer.prototype.getPCMValues = function getValuesFunction(trackPath, callback) {
    
    this.getData(trackPath, function(error, trackData) {

        if (!error) {
            
            console.log('ffprobe track data: ');
            console.log(trackData);
            
            // get audio pcm
            var ffmpegSpawn = childProcess.spawn(
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
                    'pipe:1'
                ]
            );

            var stdoutOuputString = '';
            var stderrOuputString = '';

            // TODO: uncomment for ffprobe
            //ffmpegSpawn.stdout.setEncoding('utf8');

            var oddByte = null;
            var channel = 0;

            //var outputCounter = 0;

            var maxValue = 0;

            //var output = [];

            //var counter = 0;

            ffmpegSpawn.stdout.on('data', function(data) {

                // http://nodejs.org/api/buffer.html#buffer_buf_readint16le_offset_noassert
                // https://github.com/jhurliman/node-pcm/blob/master/lib/pcm.js

                var value;
                var i;
                var dataLen = data.length;
                var percentageOfMax = 0;

                //counter++;

                for (i=0; i < dataLen; i += 2) {

                    value = data.readInt16LE(i, true);

                    //channel = ++channel % 2;

                    //console.log('B: ' + value + ' / ' + channel);

                    //outputCounter++;

                    //if (value > maxValue) maxValue = value;

                    // maxValue is 32767

                    // (value / maxValue)*100 = percentage of max
                    percentageOfMax = (value / 32767)*100;

                    //return false;
                    
                    //outputCounter++;

                }
                
                console.log(i);

                //console.log('outputCounter: ' + outputCounter);

                //console.log(maxValue); // 32767

                // get absolute value
                //var absolutePercentageOfMaxMath = Math.abs(percentageOfMax);

                //output.push(absolutePercentageOfMaxMath);

                //console.log(absolutePercentageOfMaxMath);

                /*var bar = '';

                for (i=0; i < absolutePercentageOfMaxMath/10; i++) {

                    bar += '*';

                }*/

                //console.log(bar);

            });

            ffmpegSpawn.stdout.on('end', function(data) {

                console.log('ffmpegSpawn stdout end');
                //console.log(counter);
                //console.log(outputCounter);

                if (output.length > 0) {

                    callback(false, output);

                } else {

                    callback('no output recieved');

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