[![waveform-data-generator version](https://img.shields.io/github/package-json/v/chrisweb/waveform-data-generator)](https://github.com/chrisweb/waveform-data-generator)
[![waveform-data-generator license](https://img.shields.io/github/license/chrisweb/waveform-data-generator)](https://github.com/chrisweb/waveform-data-generator)

# waveform-data-generator

Generates waveform data (peaks) that can then get visualized using for example my other project the javascript client [waveform-visualizer](https://github.com/chrisweb/waveform-visualizer) that uses animated html5 canvas or you can of course also create / use your own visualizer  

![waveform example image](https://raw.githubusercontent.com/chrisweb/waveform-visualizer/master/docs/images/waveform_example.png)

Waveform created using the visualizer with data from waveform data generator  

## Getting started

* if you haven't already, install git <https://git-scm.com/> and nodejs (<http://nodejs.org/> (which includes npm and will be used to run the server or use the cli tool)
* update npm to ensure you have the latest version installed
`npm i -g npm@latest`
* clone this project locally <https://github.com/chrisweb/waveform-data-generator>
* now install ffmeg package based on your operating system (<https://www.ffmpeg.org/download.html>) (and if you develop in windows add it to your path: <http://www.wikihow.com/Install-FFmpeg-on-Windows>)
* use your command line tool and go to the root of this project
`cd /ROOT/waveform-data-generator`
* install the required dependencies (node_modules)
`npm i`

## Launch the server

* Use your command line tool and go to the root of this project:
`cd /ROOT/waveform-data-generator`
* To lauch the server use the following command:
`npm run start`
* Open your browser and visit the following URL
`127.0.0.1:35000`
* if you see the readme of this project as homepage, it means the server is running

## Using the command line tool

* use your command line tool and go to the root of this project:
`cd /ROOT/waveform-data-generator`
* copy the song `868276.ogg` from the `/demo` folder into the `/downloads` folder or use any song of your own
* to use the cli you need to pass parameters (see the following chapter "[Cli Options (Parameters)](#cli-options-parameters)" for an explanation)
* for example use this command to create the peaks using the demo song:
`node cli ./downloads 868276 ogg 200 local json false`

note: the demo file 868276.ogg that can be found in the `/demo` folder, is a song called "[Hasta Abajo](https://www.jamendo.com/track/868276/hasta-abajo)" by artist [Kellee Maize](https://www.jamendo.com/artist/357359/kellee-maize) and released under [CC BY-SA](https://creativecommons.org/licenses/by-sa/2.0/)

### Cli Options (Parameters)

* The first parameter "./downloads" is the repository where you want the audio files to get stored
* The second parameter "868276" is the filename of the track (in my example the filename is the track ID)
* The third parameter "ogg" is the audio file format (also file exntension) of the track (ogg / mp3)
* The fourth parameter "200" is the amount of peaks you want to get
* The fifth parameter "local" tells the script if the file is already on your local machine, you can use "jamendo.com" to download music files from their library and store them locally in your /downloads directory
* The sixth parameter "json" is the type of output you want, the peaks can get outputted in either json or as a string
* The seventh parameter tells the script if it should use ffprobe to detect the track format (number of channels, the sampling frequency, ...) or use default values

## Using the web interface

* if you haven't already, start the server, using the command:
`npm run start`
* then put the following URL into your browsers address bar:
`http://127.0.0.1:35000/getwavedata?service=jamendo&trackId=868276`
* this will download the song into the `/downloads` folder and then print a json representation of the peak values on screen
* Note: currently there only two options, the first one is to use local files and the second one will download songs from [jamendo.com](https://www.jamendo.com/start), you are welcome to fork this project if you want to add another serive (source for songs) and then create a PR on github so that it can get reviewed and hopefully included into this project

### web interface Options (Parameters)

* trackId: the ID of a track [required / numeric track ID]
* trackFormat: the audio file format (file exntension) of the track (ogg or mp3) [default ogg]
* peaksAmount: the amount of peaks you want to get [default 200]
* method: the http request method to get the remote file [default GET]
* serverDirectory: the repository where you want the audio files to get stored on the server [default ./downloads]
* service: the audio file provider you want to get the track from (you can use 'local' if the file is already in your server directory) [default jamendo]
* detectFormat: tells the script if it should use ffprobe to detect the track format (number of channels, the sampling frequency, ...) or use default values (true or false) [default false]

## 🚨 Out of memory

Error "FATAL ERROR: JS Allocation failed - process out of memory"  

If the file you want to parse is too big, try increasing the memory limit of your node process, like this:  

node --max-old-space-size=1900 cli ./downloads 868276 ogg 200 local json false  

If you still run out of memory try to reduce the sample rate by passing custom values as seventh parameter, for example if the song sample rate is 44100 but runs out of memory, then try again with 22050, like this:  

node --max-old-space-size=1900 cli ./downloads 868276 ogg 200 local json sr=22050  

## TODOs

* fix memory problems for big audio files
* Create a client side waveform data generator using the web audio API (<http://www.w3.org/TR/webaudio/>)
