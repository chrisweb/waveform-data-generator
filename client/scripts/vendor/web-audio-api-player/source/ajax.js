/**
 * 
 * ajax
 * 
 * @param {type} $
 * @returns {ajax_L7.ajaxAnonym$1}
 */
define([
    'jquery'
    
], function (
    $
) {

    'use strict';
    
    /**
     * 
     * getAudioBuffer
     * 
     * @param {type} options
     * @param {type} audioContext
     * @param {type} callback
     * @returns {undefined}
     */
    var getAudioBuffer = function (options, audioContext, callback) {
        
        var xhr = new XMLHttpRequest();
        
        xhr.open('GET', '/getTrack?trackId=' + options.trackId + '&trackFormat=' + options.trackFormat, true);
        xhr.responseType = 'arraybuffer';
        xhr.send();
        
        xhr.onload = function() {
        
            audioContext.decodeAudioData(xhr.response, function onSuccess(decodedBuffer) {
                
                callback(false, decodedBuffer);
                
            }, function onFailure() {
                
                callback('decoding the buffer failed');
                
            });
            
        };

    };
    
    /**
     * 
     * get the peaks data from server
     * 
     * @param {type} options
     * @param {type} callback
     * @returns {undefined}
     */
    var getWaveDataFromServer = function getWaveDataFromServerFunction(options, callback) {
        
        if (options === undefined) {
            
            callback('options is undefined');
            
        }
        
        if (options.trackId === undefined) {
            
            callback('trackId is undefined');
            
        }
        
        if (options.trackFormat === undefined) {
            
            callback('trackFormat is undefined');
            
        }
        
        if (options.peaksAmount === undefined) {
            
            callback('peaksAmount is undefined');
            
        }
        
        if (options.service === undefined) {
            
            callback('service is undefined');
            
        }
        
        var request = $.ajax({
            url: '/getwavedata?trackId=' + options.trackId + '&trackFormat=' + options.trackFormat + '&peaksAmount=' + options.peaksAmount + '&service=' + options.service,
            type: 'GET',
            dataType: 'json'
        });

        request.done(function(data) {
            
            if (typeof data !== 'undefined' && data.peaks !== undefined) {
            
                callback(false, data.peaks);
            
            } else {
                
                if (typeof data === 'undefined' || data.error === undefined) {
                    
                    callback('undefined response from server');
                    
                } else {
                    
                    callback(data.error);
                    
                }
        
            }
            
        });

        request.fail(function(jqXHR, textStatus) {
            
            callback(textStatus);
            
        });
        
    };
    
    /**
     * public functions
     */
    return {
        getAudioBuffer: getAudioBuffer,
        getWaveDataFromServer: getWaveDataFromServer
    };

});