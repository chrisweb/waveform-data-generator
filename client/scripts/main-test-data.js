
'use strict';

/**
 * 
 * http://requirejs.org/
 * 
 * require configuration
 * 
 */
require.config({
    baseUrl: 'client/scripts',
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

    var addPlayer = function addPlayer(waveform, options) {
        
        // create an audio context
        var audioContext = audio.getContext();
        
        ajax.getAudioBuffer(options, audioContext, function(error, trackBuffer) {
            
            // if there was no error on the server
            if (!error) {

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
    
    // on dom load
    $(function() {
        
        // get the canvas element
        var $element = $('#serverWaveForm');

        var canvasContext = canvas.getContext($element);

        var waveform = new Waveform({
            canvasContext: canvasContext
        });

        var data = {peaks:[16,17,18,16,15,15,18,19,24,25,25,23,23,19,17,16,24,23,22,25,26,21,27,29,26,21,16,15,16,22,20,21,23,26,21,19,19,16,19,17,19,20,26,26,20,26,22,26,32,36,44,47,45,32,31,32,31,34,27,21,34,20,15,14,18,20,18,21,22,24,22,17,15,15,21,20,25,22,26,23,29,27,25,32,35,34,47,36,29,37,26,31,38,36,30,41,52,55,57,64,56,56,58,60,60,63,77,72,71,64,64,64,56,52,61,59,51,62,100,83,62,53,70,64,63,63,60,64,62,67,66,64,63,60,68,57,64,60,59,73,76,63,53,41,24,24,20,22,33,22,22,22,15,14,24,21,22,22,28,21,28,31,38,57,82,79,87,78,82,92,85,79,94,91,80,84,74,82,82,90,81,90,98,85,73,92,89,84,81,55,43,41,23,15,16,14,10,7,1,0]};
		
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

        trackOptions.trackId = 1100511;
        trackOptions.trackFormat = 'ogg';

        addPlayer(waveform, trackOptions);
        
    });
    
    
});