var AudioDataAnalyzer = require('./library/audio_data_analyzer').analyzer;

var TrackDownloader = require('./library/track_downloader').downloader;

var audioDataAnalyzer = new AudioDataAnalyzer();

var trackDownloader = new TrackDownloader();



var temporaryTracksDirecotry = './downloaded_tracks';
var format = 'ogg';

trackDownloader.writeTrackToDisc(415208, function writeTrackCallback(error) {
    
    if (!error) {
    
        var values = audioDataAnalyzer.getValues();

        console.log(values);
        
    } else {
        
        console.log(error);
        
    }
    
}, temporaryTracksDirecotry, format);