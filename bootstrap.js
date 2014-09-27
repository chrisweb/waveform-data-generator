var AudioDataAnalyzer = require('./library/audioDataAnalyzer').analyzer;

var FileDownloader = require('./library/fileDownloader').downloader;

var http = require('http');

var fs = require('fs');

var url = require('url');

var querystring = require('querystring');


var serverPort = 35000;
var serverIp = '127.0.0.1';

/**
 * 
 * create a new nodejs server handle incoming requests
 * 
 * @param {type} request
 * @param {type} response
 */
http.createServer(function (request, response) {
    
    // parse the url
    var urlParts = url.parse(request.url);
    
    //console.log(urlParts);
    
    // check if its is the url of a javascript file
    if (urlParts.pathname.split('.').pop() === 'js') {
        
        // if the file exists send it to the client
        // not really secure but this is a prototype
        // TODO: filter the file request
        fs.readFile('client' + urlParts.pathname, function(error, fileContent) {
            
            if (!error) {
                
                // send the static file to the client
                response.writeHead(200, { 'Content-Type': 'application/javascript' });
                response.write(fileContent);
                response.end();
                
            } else {
                
                // the file was not on the server send a 404 page to the client
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.write('page not found');
                response.end();
                
            }

        });
        
    } else {

        // handle the "routes"
        switch(urlParts.pathname) {
            case '/':
                fs.readFile('client/index.html', function(error, html) {
                    
                    if (!error) {
                    
                        // send the main html page to the client
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.write(html);
                        response.end();
                        
                    } else {
                        
                        // the main page could not be found return a page not
                        // found message
                        response.writeHead(404, { 'Content-Type': 'text/html' });
                        response.write('page not found');
                        response.end();
                        
                    }
                        
                });
                break;
            case '/getwavedata':
                
                var queryObject = querystring.parse(urlParts.query);
                
                if (typeof queryObject !== 'undefined' && queryObject.trackId !== 'undefined' && queryObject.trackFormat !== 'undefined' && queryObject.peaksAmount !== 'undefined') {

                    // track format
                    switch(options.fileExtension) {
                        case 'mp3':
                            formatCode = 'mp31';
                            break;
                        case 'ogg':
                            formatCode = 'ogg1';
                            break;
                        default:
                            throw 'unsupported file format';
                    }

                    var options = {
                        trackId: queryObject.trackId,
                        trackFormat: queryObject.trackFormat,
                        peaksAmount: queryObject.peaksAmount,
                        host: 'storage-new.newjamendo.com',
                        port: 80,
                        method: 'GET',
                        serverDirecotry: './downloaded_tracks'
                    };

                    getWaveData(options, function(error, peaks) {
                        
                        if (!error) {
                            
                            // success, send the track peaks to the client
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.write('{ "peaks": ' + JSON.stringify(peaks) + ' }');
                            response.end();
                            
                        } else {
                            
                            // fail, send the error to the client
                            response.writeHead(500, { 'Content-Type': 'application/json' });
                            response.write('{ error: ' + error + ' }');
                            response.end();
                            
                        }
                        
                    });
                    
                }
                
                break;
            case '/getTrack':
                
                var queryObject = querystring.parse(urlParts.query);
                
                console.log(queryObject);
                
                if (typeof queryObject !== 'undefined' && queryObject.trackId !== 'undefined' && queryObject.trackFormat !== 'undefined') {

                    var trackName = queryObject.trackId + '.' + queryObject.trackFormat;
                    var trackPath = 'downloaded_tracks/' + trackName;
                    
                    var fileStat = fs.statSync(trackPath);

                    var mimeType;

                    switch(queryObject.trackFormat) {
                        case 'ogg':
                            mimeType = 'audio/ogg';
                            break;
                        case 'mp3':
                            mimeType = 'audio/mpeg';
                            break;
                    }

                    response.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': fileStat.size });

                    var readStream = fs.createReadStream(trackPath);
                    
                    readStream.pipe(response);
                    
                }
                
                break;
            default:
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.write('page not found');
                response.end();
                
        }
    }
    
}).listen(serverPort, serverIp);

console.log('server is listening, ip: ' + serverIp + ', port: ' + serverPort);

/**
 * 
 * get the wave data for a given trackId
 * 
 * @param {type} options
 * @param {type} callback
 * @returns {undefined}
 */
var getWaveData = function getWaveDataFunction(options, callback) {
    
    // initialize the audioAnalyzer
    var audioDataAnalyzer = new AudioDataAnalyzer();

    // initialize the track downloader
    var fileDownloader = new FileDownloader();

    // download the track and write it on the disc of it does not already exist
    fileDownloader.writeToDisc(options, function writeFileCallback(error, trackPath) {

        // if there was no error downloading and writing the track
        if (!error) {

            // analyze the track using ffmpeg
            audioDataAnalyzer.getPeaks(trackPath, options, function getValuesCallback(error, peaks) {

                // if there was no error analyzing the track
                if (!error) {

                    callback(false, peaks);

                } else {

                    callback(error);

                }

            });

        } else {

            callback(error);

        }

    });
    
};