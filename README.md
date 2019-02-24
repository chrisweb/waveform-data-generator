# waveform-data-generator

Generates waveform data (peaks) that can then get visualized using: https://github.com/chrisweb/waveform-visualizer  

![](https://github.com/chrisweb/waveform-visualizer/blob/master/examples/images/waveform.png)

Waveform created using the visualizer with data from waveform data generator  

## Getting started

* Install git and then do a local clone of this project
* First, start by installing nodejs (http://nodejs.org/) (which includes npm) to run the server or use the cli tool
* update npm to ensure you have the latest version installed
```npm i -g npm@latest```
* Now install ffmeg package based on your operating system (https://www.ffmpeg.org/download.html) (and if you develop in windows add it to your path: http://www.wikihow.com/Install-FFmpeg-on-Windows)
* Use your command line tool and go to the root of this project (type: cd /LOCAL_PROJECT_PATH)
* type: npm install, to install the required nodejs modules (dependencies)

## Launch the server

* Use your command line tool and go to the root of this project (type: cd /LOCAL_PROJECT_PATH)
* To lauch the server type: node server
* Open your browser and type the following address: 127.0.0.1:35000

## Using the command line tool

* Use your command line tool and go to the root of this project (type: cd /LOCAL_PROJECT_PATH)
* Type: node cli PARAMETER_1 PARAMETER_2 (...)
* For example: node cli ./downloads 1100511 ogg 200 local json false

### Cli Options (Parameters)

* The first parameter "./downloads" is the repository where you want the audio files to get stored
* The second parameter "1100511" is the ID (also filename) of the track
* The third parameter "ogg" is the audio file format (also file exntension) of the track (ogg / mp3)
* The fourth parameter "200" is the amount of peaks you want to get
* The fifth parameter "local" tells the script if the file is already on your local machine, use "jamendo" to download the file from jamendo and store it the downloads directory
* The sixth parameter "json" is the type of output you want, the peaks can get outputted in either json or as a string
* The seventh parameter tells the script if it should use ffprobe to detect the track format (number of channels, the sampling frequency, ...) or use default values

## Using the web interface

* Use the following url to fetch a song from a remote source (currently only support for jamendo, fork me of you want to add another serive) and get a json containing the peaks
```http://127.0.0.1:35000/getwavedata?service=jamendo&trackId=1321406```

### web interface Options (Parameters)

* trackId: the ID of a track [required / numeric track ID]
* trackFormat: the audio file format (file exntension) of the track (ogg or mp3) [default ogg]
* peaksAmount: the amount of peaks you want to get [default 200]
* method: the http request method to get the remote file [default GET]
* serverDirectory: the repository where you want the audio files to get stored on the server [default ./downloads]
* service: the audio file provider you want to get the track from (you can use 'local' if the file is already in your server directory) [default jamendo]
* detectFormat: tells the script if it should use ffprobe to detect the track format (number of channels, the sampling frequency, ...) or use default values (true or false) [default false]

Out of memory:
--------------

Error "FATAL ERROR: JS Allocation failed - process out of memory"  

If the file you want to parse is too big, try increasing the memory limit of your node process, like this:  

node --max-old-space-size=1900 cli ./downloads 1100511 ogg 200 local json false  

If you still run out of memory try to reduce the sample rate by passing custom values as seventh parameter, for example if the song sample rate is 44100 but runs out of memory, then try again with 22050, like this:  

node --max-old-space-size=1900 cli ./downloads 1100511 ogg 200 local json sr=22050  

TODOs
-----

 * fix memory problems for big audio files
 * Create a client side waveform data generator using the web audio API (http://www.w3.org/TR/webaudio/)
