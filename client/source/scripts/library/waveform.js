/**
 * 
 * waveform
 * 
 * @param {type} $
 * @param {type} EventsManager
 * @returns {waveform_L8.waveform}
 */
define([
    'jquery',
    'event'
    
], function (
    $, EventsManager
) {

    'use strict';

    /**
     * 
     * waveform constructor
     * 
     * @param {type} options
     * @returns {undefined}
     */
    var waveform = function waveformConstructor(options) {
        
        this.canvasContext;
        this.$canvasElement;
        this.waveData;
        this.waveLayoutOptions;
        this.firstDrawing = true;
        this.latestRange;
        
        if (options !== undefined) {
            
            if (options.canvasContext !== undefined) {
                
                this.setCanvasContext(options.canvasContext);
                
            }
            
            if (options.data !== undefined) {
                
                this.setWaveData(options.data);
                
            }
            
            if (options.layout !== undefined) {
                
                this.setLayoutOptions(options.layout);
                
            }            
            
        }
        
        this.events = new EventsManager();
        
    };

    var lastLoop = (new Date()).getMilliseconds();
    var count = 1;
    var fps = 0;

    waveform.prototype.fps = function fpsFunction() {
        
        var currentLoop = (new Date()).getMilliseconds();

        if (lastLoop > currentLoop) {

            fps = count;
            
            console.log('fps: ' + fps);
            
            count = 1;

        } else {

            count += 1;

        }

        lastLoop = currentLoop;
        
    };
    
    /**
     * 
     * draw the canvas wave form
     * 
     * @param {type} range
     * @returns {undefined}
     */
    waveform.prototype.draw = function drawWaveFunction(range) {

        // measure fps
        this.fps();

        var waveLayoutOptions = setDefaultLayoutOptionsIfNotSet(this.waveLayoutOptions);

        var peaksLength = this.waveData.length;
        
        // the canvas width is the width of all the peaks, plus the width of
        // all the spaces, the amount of spaces is equal to the amount of peaks
        // minus one
        var canvasWidth = (peaksLength * waveLayoutOptions.peakWidthInPixel) + ((peaksLength - 1) * waveLayoutOptions.spaceWidthInPixel);
        
        var peaksRange = 0;
        
        if (range !== undefined) {
        
            var peaksPercentage = peaksLength / 100;
        
            peaksRange = Math.round(range * peaksPercentage);
            
            // if the range did not change since last draw don't redraw
            if (peaksRange === this.latestRange) {
                
                return;
                
            }
            
            this.latestRange = peaksRange;
            
        }
        
        var canvasHeight = waveLayoutOptions.waveHeightInPixel;
        
        // canvas dimensions
        this.$canvasElement.attr('height', canvasHeight);
        this.$canvasElement.attr('width', canvasWidth);

        // each peak is the line and the line width is the peak width
        this.canvasContext.lineWidth = waveLayoutOptions.peakWidthInPixel;
        
        // the max height of the top peaks
        var topPeakMaxHeightInPixel = waveLayoutOptions.waveHeightInPixel * (waveLayoutOptions.waveTopPercentage / 100);
        
        // the max height of the bottom peaks
        var bottomPeakMaxHeightInPixel = waveLayoutOptions.waveHeightInPixel  * ((100 - waveLayoutOptions.waveTopPercentage) / 100);
        
        // canvas background color
        this.canvasContext.fillStyle = '#' + waveLayoutOptions.waveBackgroundColorHex;
        this.canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        
        var i;
        
        for (i = 0; i < peaksLength; i++) {
            
            var topStrokeColor;
            var bottomStrokeColor;
            
            if (i < peaksRange) {
                
                topStrokeColor = '#' + waveLayoutOptions.peakTopProgressColorHex;
                bottomStrokeColor = '#' + waveLayoutOptions.peakBottomProgressColorHex;
                
            } else {
                
                topStrokeColor = '#' + waveLayoutOptions.peakTopColorHex;
                bottomStrokeColor = '#' + waveLayoutOptions.peakBottomColorHex;
                
            }
            
            var peakHeightInPercent = this.waveData[i];
            
            // the horizontal position of a peak
            var peakHorizontalPosition = ((i + 1) * waveLayoutOptions.peakWidthInPixel) + (i * waveLayoutOptions.spaceWidthInPixel);
            
            // waveform top
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(peakHorizontalPosition, topPeakMaxHeightInPixel);
            this.canvasContext.lineTo(peakHorizontalPosition, topPeakMaxHeightInPixel - (topPeakMaxHeightInPixel * (peakHeightInPercent / 100)));
            this.canvasContext.strokeStyle = topStrokeColor;
            this.canvasContext.stroke();
            
            // waveform bottom
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(peakHorizontalPosition, topPeakMaxHeightInPixel);
            this.canvasContext.lineTo(peakHorizontalPosition, topPeakMaxHeightInPixel + (bottomPeakMaxHeightInPixel * (peakHeightInPercent / 100)));
            this.canvasContext.strokeStyle = bottomStrokeColor;
            this.canvasContext.stroke();
            
        }

    };
    
    /**
     * 
     * set default layout options if not yet set by user
     * 
     * @param {type} userWaveLayoutOptions
     * @returns {unresolved}
     */
    var setDefaultLayoutOptionsIfNotSet = function setDefaultLayoutOptionsIfNotSetFunction(userWaveLayoutOptions) {
        
        if (userWaveLayoutOptions === undefined) {
            
            userWaveLayoutOptions = {};
            
        }
        
        if (userWaveLayoutOptions.waveHeightInPixel === undefined) {
            
            userWaveLayoutOptions.waveHeightInPixel = 100;
            
        }
        
        if (userWaveLayoutOptions.waveBackgroundColorHex === undefined) {
            
            userWaveLayoutOptions.waveBackgroundColorHex = 'fff';
            
        }
        
        if (userWaveLayoutOptions.peakWidthInPixel === undefined) {
            
            userWaveLayoutOptions.peakWidthInPixel = 2;
            
        }
        
        if (userWaveLayoutOptions.spaceWidthInPixel === undefined) {
            
            userWaveLayoutOptions.spaceWidthInPixel = 0;
            
        }
        
        if (userWaveLayoutOptions.waveTopPercentage === undefined) {
            
            userWaveLayoutOptions.waveTopPercentage = 50;
            
        }
        
        if (userWaveLayoutOptions.peakTopColorHex === undefined) {
            
            userWaveLayoutOptions.peakTopColorHex = '4183D7';
            
        }
        
        if (userWaveLayoutOptions.peakBottomColorHex === undefined) {
            
            userWaveLayoutOptions.peakBottomColorHex = '4B77BE';
            
        }
        
        if (userWaveLayoutOptions.peakTopProgressColorHex === undefined) {
            
            userWaveLayoutOptions.peakTopProgressColorHex = '19B5FE';
            
        }
        
        if (userWaveLayoutOptions.peakBottomProgressColorHex === undefined) {
            
            userWaveLayoutOptions.peakBottomProgressColorHex = '3498DB';
            
        }
        
        return userWaveLayoutOptions;
        
    };
    
    /**
     * 
     * add a click listener to the canvas waveform
     * 
     * @returns {undefined}
     */
    var addClickListener = function addClickListenerFunction() {
        
        var that = this;
        
        this.$canvasElement.on('click', function(event) {
            
            event.preventDefault();
            
            var canvasPositionInPixel = getMousePosition(this, event);
            
            var pixelsPerPercent = that.$canvasElement.context.width / 100;
            
            var trackPositionInPercent = canvasPositionInPixel / pixelsPerPercent;
            
            //console.log(trackPositionInPercent);
            
            that.events.trigger('waveform:position', trackPositionInPercent);
            
        });
        
    };
    
    /**
     * 
     * get the mouse position of the click on the canvas
     * 
     * @param {type} element
     * @param {type} event
     * @returns {undefined}
     */
    var getMousePosition = function getMousePositionFunction(element, event) {
        
        var boundingClientRectangle = element.getBoundingClientRect();
        
        var position = event.clientX - boundingClientRectangle.left;
        
        //console.log(position);
        
        return position;
        
    };
    
    /**
     * 
     * set the canvas context
     * 
     * @param {type} context
     * @returns {undefined}
     */
    waveform.prototype.setCanvasContext = function setCanvasContextFunction(context) {
        
        this.canvasContext = context;
        
        this.$canvasElement = $(this.canvasContext.canvas);
        
        addClickListener.call(this);
        
    };
    
    /**
     * 
     * set wave data
     * 
     * @param {type} data
     * @returns {undefined}
     */
    waveform.prototype.setWaveData = function setWaveDataFunction(data) {
        
        if (data !== undefined) {
        
            if (data instanceof Array) {

                this.waveData = data;

            } else if (data.peaks !== undefined) {

                if (data.peaks instanceof Array) {

                    this.waveData = data.peaks;

                }

            }
            
        }
        
    };

    /**
     * 
     * set layout options
     * 
     * @param {type} layoutOptions
     * @returns {undefined}
     */
    waveform.prototype.setLayoutOptions = function setLayoutOptionsFunction(layoutOptions) {
        
        this.waveLayoutOptions = layoutOptions;
        
    };

    var drawStop = false;
    var frameHandle;
    
    /**
     * 
     * update the range display in the waveform
     * 
     * @returns {undefined}
     */
    var drawRange = function drawRangeFunction() {
        
        var that = this;

        var frameHandle = requestFrame(function() {

            if (!drawStop) {
                
                that.events.once('player:progress', function(range) {

                    // redraw wave with different color until song progress
                    that.draw(range);

                    drawRange.call(that);
                    
                });
                
            }
            
        });
        
    };
    
    /**
     * 
     * start updating range
     * 
     */
    waveform.prototype.updateRangeStart = function drawRangeFunction() {
        
        drawStop = false;

        drawRange.call(this);
        
    };
    
    /**
     * 
     * stop updating range
     * 
     * @returns {undefined}
     */
    waveform.prototype.updateRangeStop = function updateRangeStopFunction() {
        
        drawStop = true;
        
        if (typeof frameHandle !== 'undefined') {
            
            clearInterval(frameHandle);
            
            
        }
        
        this.events.off('player:progress');
        
    };

    /**
     * 
     * request (animation) frame
     * 
     * @param {type} callback
     * @returns {Window.requestAnimationFrame|window.requestAnimationFrame|Function|window.oRequestAnimationFrame|Window.oRequestAnimationFrame|Window.webkitRequestAnimationFrame|window.webkitRequestAnimationFrame|Window.msRequestAnimationFrame|window.msRequestAnimationFrame|Window.mozRequestAnimationFrame|window.mozRequestAnimationFrame}
     */
    var requestFrame = (function requestFrameFunction(callback) {
        
        // requestAnimationFrame() shim by Paul Irish
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function(callback){
                    frameHandle = window.setTimeout(callback, 1000 / 60);
                };
        
    })();
    
    /**
     * public functions
     */
    return waveform;

});