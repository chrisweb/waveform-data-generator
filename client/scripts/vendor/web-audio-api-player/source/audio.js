/**
 * 
 * audio
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 * 
 * @returns {audio_L6.audioAnonym$1}
 */
define([

], function (

) {

    'use strict';

    /**
     * 
     * get the web audio api audiocontext
     * 
     * @returns {undefined}
     */
    var getContext = function getContextFunction() {
        
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        
        var audioContext = new AudioContext();
        
        return audioContext;
        
    };
    
    /**
     * public functions
     */
    return {
        getContext: getContext
    };

});