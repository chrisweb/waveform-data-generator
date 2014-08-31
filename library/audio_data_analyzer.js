
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
 * @returns {undefined}
 */
analyzer.prototype.getValues = function getValuesFunction(trackPath, callback) {

    // pcm audio data
    var channels = 1;
    var sampleRate = 44100;

    var ffmpegSpawn = childProcess.spawn(
        'ffmpeg',
        [
            '-i',
            trackPath,
            '-f',
            's16le',
            '-ac',
            channels,
            '-acodec',
            'pcm_s16le',
            '-ar',
            sampleRate,
            '-y',
            'pipe:1'
        ]
    );

    var output = '';

    // TODO: uncomment for ffprobe
    //ffmpegSpawn.stdout.setEncoding('utf8');

    var oddByte = null;
    var channel = 0;
    
    var outputCounter = 0;
    
    var maxValue = 0;
    
    var output = [];

    ffmpegSpawn.stdout.on('data', function(data) {

        // http://nodejs.org/api/buffer.html#buffer_buf_readint16le_offset_noassert
        // https://github.com/jhurliman/node-pcm/blob/master/lib/pcm.js

        var value;
        var i;
        var dataLen = data.length;
        var percentageOfMax = 0;

        for (i=0; i < dataLen; i += 2) {
            
            value = data.readInt16LE(i, true);
            
            //channel = ++channel % 2;
            
            //console.log('B: ' + value + ' / ' + channel);
            
            outputCounter++;

            //if (value > maxValue) maxValue = value;
            
            // maxValue is 32767
            
            // (value / maxValue)*100 = percentage of max
            percentageOfMax = (value / 32767)*100;
            
            //return false;
            
        }
        
        //console.log('outputCounter: ' + outputCounter);
        
        //console.log(maxValue); // 32767
        
        // get absolute value
        var absolutePercentageOfMaxMath = Math.abs(percentageOfMax);
        
        output.push(absolutePercentageOfMaxMath);
        
        //console.log(absolutePercentageOfMaxMath);
        
        /*var bar = '';
        
        for (i=0; i < absolutePercentageOfMaxMath/10; i++) {
            
            bar += '*';
            
        }*/
        
        //console.log(bar);

    });

    ffmpegSpawn.stdout.on('end', function(data) {

        console.log('ffmpegSpawn stdout end');

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
    
};

module.exports.analyzer = analyzer;