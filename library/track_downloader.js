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
 * @param {type} temporaryTracksDirecotry
 * @param {type} format
 * @returns {undefined}
 */
downloader.prototype.writeTrackToDisc = function(trackId, temporaryTracksDirecotry, format) {

    if (temporaryTracksDirecotry === undefined) {
        
        temporaryTracksDirecotry = '';
        
    }
    
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

    var trackPath = temporaryTracksDirecotry + '/' + trackId + '.' + format;

    // 
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

                moveTrack();

            });

        });

        httpRequest.on('error', function(error) {

            console.log('writeTrackToDisc, http request error: ' + error.message);

            writeStream.end();

        });

        httpRequest.end();

    });

    writeStream.on('error', function(error) {

        console.log('writeTrackToDisc writeStream, error: ' + error);

        writeStream.end();

    });

};

module.exports.downloader = downloader;