
'use strict';

/**
 * 
 * http://requirejs.org/
 * 
 * require configuration
 * 
 */
require.config({
    baseUrl: 'scripts',
    paths: {
        // vendor scripts
        'jquery': 'vendor/jquery/dist/jquery',
        'player': 'vendor/web-audio-api-player/source/player',
        'ajax': 'vendor/web-audio-api-player/source/ajax',
        'audio': 'vendor/web-audio-api-player/source/audio',
        
        // own small event manager for this example
        'event': 'library/event',
        
        // waveform visualizer scripts
        'canvas': '../../../source/scripts/library/canvas',
        'waveform': '../../../source/scripts/library/waveform'
    }
    
});

/**
 * 
 * main require
 * 
 * @param {type} $
 * @param {type} ajax
 * @param {type} Waveform
 * @param {type} canvas
 * @param {type} audio
 * @param {type} Player
 * @returns {undefined}
 */
require([
    'jquery',
    'ajax',
    'waveform',
    'canvas',
    'audio',
    'player'
    
], function ($, ajax, Waveform, canvas, audio, Player) {
    
    // on dom load
    $(function() {

        // WAVEFORM 1
        var options = {};

        //options.trackId = 1100511;
		options.trackId = 243;
        options.peaksAmount = 400;
        options.trackFormat = 'ogg';
        options.service = 'jamendo';
        
        // paint a waveform using server data
        ajax.getWaveDataFromServer(options, function(error, data) {
            
            // if there was no error on the server
            if (!error) {
                
                // get the canvas element
                var $element = $('#serverWaveForm_1');

                var canvasContext = canvas.getContext($element);

                var waveform = new Waveform({
                    canvasContext: canvasContext
                });

                // set waveform data
                waveform.setWaveData(data);

                // set the optioms
                var layoutOptions = {};

                layoutOptions.waveHeightInPixel = 200;
                layoutOptions.waveBackgroundColorHex = 'f8f8f8';
                layoutOptions.peakWidthInPixel = 2;
                layoutOptions.spaceWidthInPixel = 1;
                layoutOptions.waveTopPercentage = 70;
                layoutOptions.peakTopColorHex = '6c00ff';
                layoutOptions.peakBottomColorHex = 'bd8cff';
                layoutOptions.peakTopProgressColorHex = '380085';
                layoutOptions.peakBottomProgressColorHex = '8265ab';
                
                waveform.setLayoutOptions(layoutOptions);

                // draw the waveform using the waveform module
                waveform.draw();
                
                var trackOptions = {};

                trackOptions.trackId = 243;
                trackOptions.trackFormat = 'ogg';
                
                addPlayer(waveform, trackOptions);
                
            } else {
                
                // log the server error
                console.log(error);
                
            }
            
        });
        
        // WAVEFORM 2
        /*var options = {};

        options.trackId = 1100511;
        options.peaksAmount = 400;
        options.trackFormat = 'mp3';
        options.service = 'jamendo';
        
        // paint a waveform using server data
        ajax.getWaveDataFromServer(options, function(error, data) {
            
            // if there was no error on the server
            if (!error) {

                // get the canvas element
                var $element = $('#serverWaveForm_2');

                var canvasContext = canvas.getContext($element);

                var waveform = new Waveform({
                    canvasContext: canvasContext
                });

                // set waveform data
                waveform.setWaveData(data);

                // draw the waveform using the waveform module
                waveform.draw();
                
                var trackOptions = {};

                trackOptions.trackId = 1100511;
                trackOptions.trackFormat = 'mp3';
                
                addPlayer(waveform, options);
                
            } else {
                
                // log the server error
                console.log(error);
                
            }
            
        });*/
        
    });
    
    var addPlayer = function addPlayer(waveform, options) {
        
        // create an audio context
        var audioContext = audio.getContext();
        
        ajax.getAudioBuffer(options, audioContext, function(error, trackBuffer) {
            
            // if there was no error on the server
            if (!error) {

                // analyze track again but this time using the client
                // web audio api
                //analyzer.analyzeTrack(trackBuffer);

                // player
                var player = new Player({ audioContext: audioContext });
                
                player.setBuffer(trackBuffer);
                
                var $button = $('<button>');
                
                $button.addClass('play').text('>');
                
                var $body = $('body');
                
                $body.find('.player').append($button);
                
                $button.on('click', function() {
                    
                    if ($(this).hasClass('play')) {
                    
                        player.play();
                        
                        $button.removeClass('play').addClass('pause').text('||');
                        
                        waveform.updateRangeStart();
                        
                    } else {
                        
                        player.pause();
                        
                        $button.removeClass('pause').addClass('play').text('>');
                        
                        waveform.updateRangeStop();
                        
                    }
                    
                });
                
            } else {
                
                // log the server error
                console.log(error);
                
            }
            
        });
        
    };
    
});