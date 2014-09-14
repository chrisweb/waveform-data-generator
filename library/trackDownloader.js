// nodejs fs
var fs = require('fs');

// nodejs http
var http = require('http');

var DirectoryManager = require('./directoryManager').directoryManager;

var FileManager = require('./fileManager').fileManager;


/**
 * 
 * track downloader
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
    
    var directoryManager = new DirectoryManager();
    
    var that = this;
    
    // check if the temporary tracks directory already exists
    directoryManager.exists(temporaryTracksDirecotry, function directoryExistsCallback(error, exists) {
        
        // if there was no error checking if the directory exists
        if (!error) {
        
            // if the directory does not exist
            if (!exists) {
            
                // create a new directory
                directoryManager.create(temporaryTracksDirecotry, createDirectoryCallback = function(error) {
                
                    // if there was no error creating the new directory
                    if (!error) {
                        
                        // download the the track and store it on disc
                        that.downloadIfNotExists(trackId, callback, temporaryTracksDirecotry, format);
                        
                    } else {
            
                        callback(error);

                    }
                
                });
            
            } else {
                
                // download the the track and store it on disc
                that.downloadIfNotExists(trackId, callback, temporaryTracksDirecotry, format);
                
            }
            
        } else {            
            
            callback(error);
            
        }
        
    });
    
};

/**
 * 
 * donwloads a track if does not already exist on disc
 * 
 * @param {type} trackId
 * @param {type} callback
 * @param {type} temporaryTracksDirecotry
 * @param {type} format
 * @returns {undefined}
 */
downloader.prototype.downloadIfNotExists = function downloadIfNotExists(trackId, callback, temporaryTracksDirecotry, format) {
    
    var fileManager = new FileManager();
    
    var fileName = trackId + '.' + format;
    
    var filePath = temporaryTracksDirecotry + '/' + fileName;
    
    var that = this;
    
    // check if the file already exists
    fileManager.exists(filePath, function fileExistsCallback(error, exists) {
        
        // if there was no error checking if the file exists
        if (!error) {
            
            if (!exists) {
            
                // download the file and store it in the temporary directory
                that.downloadFile(trackId, callback, filePath, format);
                
            } else {
                
                callback(false, filePath);
                
            }
            
        } else {            
            
            callback(error);
            
        }
        
    });
    
};

/**
 * 
 * download a file
 * 
 * @param {type} trackId
 * @param {type} callback
 * @param {type} trackPath
 * @param {type} format
 * @returns {undefined}
 */
downloader.prototype.downloadFile = function downloadFileFunction(trackId, callback, trackPath, format) {
    
    console.log('downloadFile: ' + trackId);
    
    if (format === undefined) {
        
        format = 'ogg';
        
    }
    
    var formatCode;
    
    // track format
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

    // request options
    var options = {
        hostname: 'storage-new.newjamendo.com',
        port: 80,
        path: '/download/track/' + trackId + '/' + formatCode,
        method: 'GET'
    };

    var writeStream = fs.createWriteStream(trackPath);

    // open a new write stream
    writeStream.on('open', function() {

        // request the file from remote server
        var httpRequest = http.request(options, function(httpResponse) {

            console.log('writeTrackToDisc httpRequest STATUS: ' + httpResponse.statusCode);
            console.log('writeTrackToDisc httpRequest HEADERS: ' + JSON.stringify(httpResponse.headers));

            // on successful request
            httpResponse.on('data', function(chunk) {

                // write the file
                writeStream.write(chunk);

            });

            // the connection got closed
            httpResponse.on('end', function() {

                console.log('file ' + trackPath + ' got downloaded into ' + trackPath);

                // close the write stream
                writeStream.end();

                callback(false, trackPath);

            });

        });

        // the request to the remote server failed
        httpRequest.on('error', function(error) {

            console.log('writeTrackToDisc, http request error: ' + error.message);

            writeStream.end();
            
            callback(error);

        });

        httpRequest.end();

    });

    // writing the file failed
    writeStream.on('error', function(error) {

        console.log('writeTrackToDisc writeStream, error: ' + error);

        // close the stream
        writeStream.end();
        
        callback(error);

    });

};

module.exports.downloader = downloader;