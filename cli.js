var waveformData = require('./server/library/waveformData');

var queryObject = {};

process.argv.forEach(function (value, index, array) {
    
    var commandParametersLength = array.length - 2;
    
    if (commandParametersLength !== 7) {
        
        var error = 'invalid parameters length, please call the cli with the following parameters: node cli SERVER_PATH TRACK_NAME TRACK_EXTENSION AMOUT_OF_PEAKS LOCAL_OR_REMOTE_SERVICENAME PEAKSLIST_OUTPUT_FORMAT TRACK_FORMAT_DETECTION\n';
        
        process.stderr.write(error + "\n");

        process.exit(1);
        
    } 
    
    if (index === 2) {
        
        queryObject.serverDirectory = value;
        
    }
    
    if (index === 3) {
        
        queryObject.trackId = value;
        
    }
    
    if (index === 4) {
        
        queryObject.trackFormat = value.toLowerCase();
        
    }
    
    if (index === 5) {
        
        queryObject.peaksAmount = parseInt(value);
        
    }
    
    if (index === 6) {
        
        queryObject.service = value.toLowerCase();
        
    }
    
    if (index === 7) {
        
        queryObject.outputFormat = value.toLowerCase();
        
    }
    
    if (index === 8) {
        
        if (typeof value === 'boolean') {
        
            queryObject.detectFormat = value;
            
        } else {
            
            var detectFormat = value.toLowerCase();
            
            if (detectFormat === 'true') {
                
                queryObject.detectFormat = true;
                
            } else {
                
                queryObject.detectFormat = false;
                
            }
            
        }
        
    }
    
});

var outputResponse = function outputResponseFunction(error, peaks) {

    if (error) {

        process.stderr.write(error + "\n");

        process.exit(1);

    } else {

        var output = '';

        // outputFormat can be json or text
        if (queryObject.outputFormat === 'json') {

            var outputData = {
                "peaks": peaks
            };
            
            output = JSON.stringify(outputData);
            
        } else {
            
            var peaksString = '';
            var i;
            var peaksLength = peaks.length;

            for (i = 0; i < peaksLength; i++) {

                peaksString += peaks[i] + ',';

            }
            
            output = peaksString.substring(0, peaksString.length - 1);
            
        }
        
        process.stdout.write(output + "\n");

        process.exit(0);

    }
    
};

if (queryObject.service === 'local') {
    
    // node cli ./downloads 1100511 ogg 200 local json false
    // node cli ./downloads 1100511 mp3 200 local json false
    waveformData.getLocalWaveData(queryObject, outputResponse);
    
} else {
    
    // node cli ./downloads 1100511 ogg 200 jamendo json false
    // node cli ./downloads 1100511 mp3 200 jamendo json false
    waveformData.getRemoteWaveData(queryObject, outputResponse);
    
}