// nodejs fs
var fs = require('fs');

// nodejs http
var http = require('http');

var DirectoryManager = require('./directoryManager').directoryManager;

var directoryManager = new DirectoryManager();

/**
 * 
 * @returns {downloaderConstructor}
 */
var downloader = function downloaderConstructor() {
    
};

/**
 * 
 * fetches a track from jamendo.com and writes it into the temporary folder
 * on disc
 * 
 * @param {type} trackId
 * @param {type} callback
 * @param {type} temporaryTracksDirecotry
 * @param {type} format
 * @returns {undefined}
 */
downloader.prototype.writeTrackToDisc = function(trackId, callback, temporaryTracksDirecotry, format) {

    if (temporaryTracksDirecotry === undefined) {
        
        temporaryTracksDirecotry = './downloaded_tracks';
        
    }
    
    directoryManager.exists(temporaryTracksDirecotry, function directoryExistsCallback(error, exists) {
        
        if (!error) {
        
            if (!exists) {
            
                directoryManager.create(temporaryTracksDirecotry, createDirectoryCallback = function(error) {
                
                    if (!error) {
                        
                        downloadFile(trackId, callback, temporaryTracksDirecotry, format);
                        
                    } else {
            
                        callback(error);

                    }
                
                });
            
            } else {
                
                downloadFile(trackId, callback, temporaryTracksDirecotry, format);
                
            }
            
        } else {            
            
            callback(error);
            
        }
        
    });
    
};
    
var downloadFile = function downloadFileFunction(trackId, callback, temporaryTracksDirecotry, format) {
    
    console.log('downloadFile: ' + trackId);
    
    if (format === undefined) {
        
        format = 'ogg';
        
    }
    
    var formatCode;
    
    switch(format) {
        case 'mp3':
            formatCode = 'mp31';
            break;
        case 'ogg':
            formatCode = 'ogg1';
            break;
        default:
            throw 'unsupported track format';
    }
    
    var trackFileName = trackId + '.' + format;

    var trackPath = temporaryTracksDirecotry + '/' + trackFileName;

    // request options
    var options = {
        hostname: 'storage-new.newjamendo.com',
        port: 80,
        path: '/download/track/' + trackId + '/' + formatCode,
        method: 'GET'
    };

    var writeStream = fs.createWriteStream(trackPath);

    writeStream.on('open', function() {

        var httpRequest = http.request(options, function(httpResponse) {

            console.log('writeTrackToDisc httpRequest STATUS: ' + httpResponse.statusCode);
            console.log('writeTrackToDisc httpRequest HEADERS: ' + JSON.stringify(httpResponse.headers));

            httpResponse.on('data', function(chunk) {

                writeStream.write(chunk);

            });

            httpResponse.on('end', function() {

                console.log('file ' + trackFileName + ' got downloaded into ' + trackPath);

                writeStream.end();

                callback(false, trackPath);

            });

        });

        httpRequest.on('error', function(error) {

            console.log('writeTrackToDisc, http request error: ' + error.message);

            writeStream.end();
            
            callback(error);

        });

        httpRequest.end();

    });

    writeStream.on('error', function(error) {

        console.log('writeTrackToDisc writeStream, error: ' + error);

        writeStream.end();
        
        callback(error);

    });

};

module.exports.downloader = downloader;