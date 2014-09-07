var AudioDataAnalyzer = require('./library/audioDataAnalyzer').analyzer;

var TrackDownloader = require('./library/trackDownloader').downloader;

var http = require('http');

var fs = require('fs');

var url = require('url');


var serverPort = 35000;
var serverIp = '127.0.0.1';

http.createServer(function (request, response) {
    
    var urlParts = url.parse(request.url);
    
    console.log(urlParts.path);
    
    switch(urlParts.path) {
        case '/':
            fs.readFile('client/index.html', function(error, html) {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.write(html);
                response.end();
            });
            break;
        case '/getwavedata':
            var trackId = '415208';
            getWaveData(trackId);
            break;
        default:
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.write('page not found');
            response.end();
    }
    
}).listen(serverPort, serverIp);

console.log('server is listening, ip: ' + serverIp + ', port: ' + serverPort);

var getWaveData = function getWaveDataFunction(trackId) {
    
    var audioDataAnalyzer = new AudioDataAnalyzer();

    var trackDownloader = new TrackDownloader();
    
    var temporaryTracksDirecotry = './downloaded_tracks';
    var format = 'ogg';

    trackDownloader.writeTrackToDisc(trackId, function writeTrackCallback(error, trackPath) {

        if (!error) {

            audioDataAnalyzer.getPCMValues(trackPath, function getValuesCallback(error, values) {

                if (!error) {

                    console.log(values);
                    console.log('values count: ' + values.length);

                } else {

                    console.log(error);

                }

            });

        } else {

            console.log(error);

        }

    }, temporaryTracksDirecotry, format);
    
};