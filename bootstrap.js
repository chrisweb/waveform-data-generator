var AudioDataAnalyzer = require('./library/audio_data_analyzer').analyzer;

var TrackDownloader = require('./library/track_downloader').downloader;

var audioDataAnalyzer = new AudioDataAnalyzer();

var trackDownloader = new TrackDownloader();

trackDownloader.writeTrackToDisc(415208);



var values = audioDataAnalyzer.getValues();

console.log(values);