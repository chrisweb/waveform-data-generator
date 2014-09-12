var AudioDataAnalyzer = require('./library/audioDataAnalyzer').analyzer;

var TrackDownloader = require('./library/trackDownloader').downloader;

var http = require('http');

var fs = require('fs');

var url = require('url');


var serverPort = 35000;
var serverIp = '127.0.0.1';

http.createServer(function (request, response) {
    
    var urlParts = url.parse(request.url);
    
    if (urlParts.path.split('.').pop() === 'js') {
        
        // not secure but this is a prototype
        fs.readFile('client' + urlParts.path, function(error, fileContent) {
            
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

        switch(urlParts.path) {
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
                var trackId = '1135703';
                var peaksAmount = '200';
                getWaveData(trackId, peaksAmount);
                break;
            default:
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.write('page not found');
                response.end();
                
        }
    }
    
}).listen(serverPort, serverIp);

console.log('server is listening, ip: ' + serverIp + ', port: ' + serverPort);

var getWaveData = function getWaveDataFunction(trackId, peaksAmount) {
    
    var audioDataAnalyzer = new AudioDataAnalyzer();

    var trackDownloader = new TrackDownloader();
    
    var temporaryTracksDirecotry = './downloaded_tracks';
    var format = 'ogg';

    trackDownloader.writeTrackToDisc(trackId, function writeTrackCallback(error, trackPath) {

        if (!error) {

            audioDataAnalyzer.getPeaks(trackPath, peaksAmount, function getValuesCallback(error, peaks) {

                if (!error) {

                    console.log(peaks);

                } else {

                    console.log(error);

                }

            });

        } else {

            console.log(error);

        }

    }, temporaryTracksDirecotry, format);
    
};