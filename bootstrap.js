var AudioDataAnalyzer = require('./library/audio_data_analyzer').analyzer;

var TrackDownloader = require('./library/track_downloader').downloader;

var audioDataAnalyzer = new AudioDataAnalyzer();

var trackDownloader = new TrackDownloader();



var temporaryTracksDirecotry = './downloaded_tracks';
var format = 'ogg';

trackDownloader.writeTrackToDisc(415208, function writeTrackCallback(error, trackPath) {
    
    if (!error) {
    
        var values = audioDataAnalyzer.getValues(trackPath, function getValuesCallback(error, values) {
            
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