var AudioDataAnalyzer = require('./library/audioDataAnalyzer').analyzer;

var TrackDownloader = require('./library/trackDownloader').downloader;

var http = require('http');

var fs = require('fs');

var url = require('url');

var querystring = require('querystring');


var serverPort = 35000;
var serverIp = '127.0.0.1';

http.createServer(function (request, response) {
    
    var urlParts = url.parse(request.url);
    
    if (urlParts.pathname.split('.').pop() === 'js') {
        
        // not secure but this is a prototype
        fs.readFile('client' + urlParts.pathname, function(error, fileContent) {
            
            if (!error) {
                
                response.writeHead(200, { 'Content-Type': 'application/javascript' });
                response.write(fileContent);
                response.end();
                
            } else {
                
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.write('page not found');
                response.end();
                
            }

        });
        
    } else {

        console.log(urlParts);

        switch(urlParts.pathname) {
            case '/':
                fs.readFile('client/index.html', function(error, html) {
                    
                    if (!error) {
                    
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.write(html);
                        response.end();
                        
                    } else {
                        
                        response.writeHead(404, { 'Content-Type': 'text/html' });
                        response.write('page not found');
                        response.end();
                        
                    }
                        
                });
                break;
            case '/getwavedata':
                
                var queryObject = querystring.parse(urlParts.query);
                
                if (typeof queryObject !== 'undefined' && queryObject.trackId !== 'undefined' && queryObject.peaksAmount !== 'undefined') {

                    getWaveData(queryObject.trackId, queryObject.peaksAmount, function(error, peaks) {
                        
                        if (!error) {
                            
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.write('{ "peaks": ' + JSON.stringify(peaks) + ' }');
                            response.end();
                            
                        } else {
                            
                            response.writeHead(500, { 'Content-Type': 'application/json' });
                            response.write('{ error: ' + error + ' }');
                            response.end();
                            
                        }
                        
                    });
                    
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

var getWaveData = function getWaveDataFunction(trackId, peaksAmount, callback) {
    
    var audioDataAnalyzer = new AudioDataAnalyzer();

    var trackDownloader = new TrackDownloader();
    
    var temporaryTracksDirecotry = './downloaded_tracks';
    var format = 'ogg';

    trackDownloader.writeTrackToDisc(trackId, function writeTrackCallback(error, trackPath) {

        if (!error) {

            audioDataAnalyzer.getPeaks(trackPath, peaksAmount, function getValuesCallback(error, peaks) {

                if (!error) {

                    callback(false, peaks);

                } else {

                    callback(error);

                }

            });

        } else {

            callback(error);

        }

    }, temporaryTracksDirecotry, format);
    
};