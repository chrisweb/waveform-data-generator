/**
 * 
 * player
 * 
 * @param {type} EventsManager
 * @param {type} AudioContextManager
 * @returns {player_L7.player}
 */
define([
    'event',
    'audio'
    
], function (
    EventsManager,
    AudioContextManager
) {

    'use strict';
    
    /**
     * 
     * player constructor
     * 
     * @param {type} options
     * @returns {player_L9.player}
     */
    var player = function playerConstructor(options) {
        
        this.audioContext;
        this.audioGraph;
        this.track;
        this.intervalHandler;
        
        if (options !== undefined) {
            
            if (options.audioContext !== undefined) {
                
                this.setAudioContext(options.audioContext);
                
            }
            
            if (options.trackBuffer !== undefined) {
                
                this.setBuffer(options.trackBuffer);
                
            }
            
        }
        
        this.events = new EventsManager();
        
    };
    
    /**
     * 
     * play
     * 
     * @returns {undefined}
     */
    player.prototype.play = function playFunction() {
        
        if (this.audioGraph === undefined) {
            
            this.createAudioGraph();
            
        }
        
        if (this.audioGraph.sourceNode.buffer === null) { 
        
            // add a buffered song to the source node
            this.audioGraph.sourceNode.buffer = this.track.buffer;
        
        }
        
        // the time right now (since the this.audiocontext got created)
        this.track.startTime = this.audioGraph.sourceNode.context.currentTime;

        this.audioGraph.sourceNode.start(0, this.track.playTimeOffset);
        
        startTimer.call(this);
        
        startListeningForPositionChange.call(this);
        
        this.track.isPlaying = true;
        
    };
    
    /**
     * 
     * pause
     * 
     * @returns {undefined}
     */
    player.prototype.pause = function pauseFunction() {
        
        if (!this.track.isPlaying) {
            
            return;
            
        }
        
        var timeAtPause = this.audioGraph.sourceNode.context.currentTime;
        
        this.track.playTimeOffset += timeAtPause - this.track.startTime;
        
        this.stop();
        
    };
    
    /**
     * 
     * stop
     * 
     * @returns {undefined}
     */
    player.prototype.stop = function stopFunction() {
        
        if (!this.track.isPlaying) {
            
            return;
            
        }
        
        // stop the track playback
        this.audioGraph.sourceNode.stop(0);
        
        stopTimer.call(this);
        
        stopListeningForPositionChange.call(this);
        
        this.track.isPlaying = false;
        
        // after a stop you cant call a start again, you need to create a new
        // source node, this means that we unset the audiograph after a stop
        // so that it gets recreated on the next play
        this.audioGraph = undefined;
        
    };
    
    /**
     * 
     * create a new audio context
     * 
     * @returns {undefined}
     */
    player.prototype.createAudioContext = function createAudioContextFunction() {
        
        this.audioContext = AudioContextManager.getContext();
        
    };
    
    /**
     * 
     * set audio context
     * 
     * @param {type} context
     * @returns {undefined}
     */
    player.prototype.setAudioContext = function setAudioContextFunction(context) {
        
        this.audioContext = context;
        
    };
    
    /**
     * 
     * create an audio graph
     * 
     * @returns {undefined}
     */
    player.prototype.createAudioGraph = function createAudioGraphFunction() {
        
        if (this.audioContext === undefined) {
            
            this.createAudioContext();
            
        }
        
        this.audioGraph = {};
        
        // create an audio buffer source node
        this.audioGraph.sourceNode = this.audioContext.createBufferSource();
        
        // create a gain node
        this.audioGraph.gainNode = this.audioContext.createGain();
        
        // connect the source node to the gain node
        this.audioGraph.sourceNode.connect(this.audioGraph.gainNode);
        
        // create a panner node
        this.audioGraph.pannerNode = this.audioContext.createPanner();
        
        // connect the gain node to the panner node
        this.audioGraph.gainNode.connect(this.audioGraph.pannerNode);
        
        // connect to the panner node to the destination (speakers)
        this.audioGraph.pannerNode.connect(this.audioContext.destination);
        
    };
    
    /**
     * 
     * set an external audio graph
     * 
     * @param {type} audioGraph
     * @returns {undefined}
     */
    player.prototype.setAudioGraph = function setAudioGraphFunction(audioGraph) {
        
        this.audioGraph = audioGraph;
        
    };
    
    /**
     * 
     * set buffer
     * 
     * @param {type} buffer
     * @returns {undefined}
     */
    player.prototype.setBuffer = function setBufferFunction(buffer) {
        
        // create a new track object
        this.track = {
            playTimeOffset: 0,
            currentTime: 0,
            buffer: null,
            startTime: 0,
            playTime: 0,
            playedTimePercentage: 0,
            isPlaying: false
        };
        
        this.track.buffer = buffer;
        
    };
    
    /**
     * 
     * panner node change
     * 
     * @param {type} left
     * @param {type} right
     * @returns {undefined}
     */
    player.prototype.pannerChange = function(left, right) {
        
        // https://developer.mozilla.org/en-US/docs/Web/API/PannerNode
        
        this.audioGraph.pannerNode.setPosition(0, 0, 0);
        
    };
    
    /**
     * 
     * gain node volume change
     * 
     * @param {type} volumeInPercent
     * @returns {undefined}
     */
    player.prototype.volumeChange = function(volumeInPercent) {
        
        // https://developer.mozilla.org/en-US/docs/Web/API/GainNode
        
        this.audioGraph.gainNode.value = volumeInPercent / 100;
        
    };
    
    /**
     * 
     * starts the timer that triggers the progress events
     * 
     * @returns {undefined}
     */
    var startTimer = function startTimerFunction() {
        
        var triggerProgressEventBinded = triggerProgressEvent.bind(this);
        
        this.intervalHandler = setInterval(triggerProgressEventBinded, 200);
        
    };
    
    /**
     * 
     * stops the timer that triggers the progress events
     * 
     * @returns {undefined}
     */
    var stopTimer = function stopTimerFunction() {
        
        clearInterval(this.intervalHandler);
        
    };
    
    /**
     * 
     * trigger progress event
     * 
     * @returns {undefined}
     */
    var triggerProgressEvent = function triggerProgressEventFunction() {

        var timeNow = this.audioGraph.sourceNode.context.currentTime;
        
        this.track.playTime = (timeNow - this.track.startTime) + this.track.playTimeOffset;
        
        this.track.playedTimePercentage = (this.track.playTime / this.track.buffer.duration) * 100;
        
        this.events.trigger('player:progress', this.track.playedTimePercentage);
        
    };
    
    /**
     * 
     * start listening for a position change request
     * 
     * @returns {undefined}
     */
    var startListeningForPositionChange = function startListeningForPositionChangeFunction() {
        
        var that = this;
        
        this.events.on('waveform:position', function(trackPositionInPercent) {
            
            //console.log(trackPositionInPercent);

            // stop the track playback
            that.stop();

            var trackPositionInSeconds = (that.track.buffer.duration / 100) * trackPositionInPercent;
            
            that.track.playTimeOffset = trackPositionInSeconds;

            // start the playback at the given position
            that.play();
            
        });
        
    };
    
    /**
     * 
     * stop listening for position change requests
     * 
     * @returns {undefined}
     */
    var stopListeningForPositionChange = function stopListeningForPositionChangeFunction() {
        
        this.events.off('waveform:position');
        
    };

    /**
     * public functions
     */
    return player;

});