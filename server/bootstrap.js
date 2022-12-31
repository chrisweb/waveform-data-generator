import { createServer } from 'http'
import { readFile, statSync, createReadStream } from 'fs'
import { parse } from 'url'
import { parse as _parse } from 'querystring'
import { getRemoteWaveData } from './library/waveformData.js'
import { marked } from 'marked'

const serverPort = process.env.PORT || 35000
const serverIp = process.env.HOSTNAME || '127.0.0.1'

/**
 * 
 * create a new nodejs server handle incoming requests
 * 
 * @param {type} request
 * @param {type} response
 */
const server = createServer(function (request, response) {

    // parse the url
    const urlParts = parse(request.url)

    // check if its is the url of a javascript file
    if (urlParts.pathname.split('.').pop() === 'js') {

        // if the file exists send it to the client
        // not really secure but this is a prototype
        // TODO: filter the file request
        readFile('client' + urlParts.pathname, function (error, fileContent) {

            if (!error) {
                // send the static file to the client
                response.writeHead(200, { 'Content-Type': 'application/javascript' })
                response.write(fileContent)
                response.end()
            } else {
                // the file was not on the server send a 404 page to the client
                response.writeHead(404, { 'Content-Type': 'text/html' })
                response.write('page not found')
                response.end()
            }

        })

    } else {

        let queryObject

        // handle the "routes"
        switch (urlParts.pathname) {
            case '/':
                /*fs.readFile('client/index.html', function (error, html) {

                    if (!error) {
                        // send the main html page to the client
                        response.writeHead(200, { 'Content-Type': 'text/html' })
                        response.write(html)
                        response.end()
                    } else {
                        // the main page could not be found return a page not
                        // found message
                        response.writeHead(404, { 'Content-Type': 'text/html' })
                        response.write('page not found')
                        response.end()
                    }

                })*/

                readFile('README.md', 'utf-8', function (error, document) {

                    if (!error) {
                        // send the main html page to the client
                        response.writeHead(200, { 'Content-Type': 'text/html' })
                        response.write(marked(document))
                        response.end()
                    } else {
                        // the main page could not be found return a page not
                        // found message
                        response.writeHead(404, { 'Content-Type': 'text/html' })
                        response.write('page not found')
                        response.end()
                    }

                })

                break
            case '/getwavedata':

                queryObject = _parse(urlParts.query)

                if (typeof queryObject !== 'undefined') {

                    getRemoteWaveData(queryObject, function (error, peaks) {

                        if (!error) {
                            // success, send the track peaks to the client
                            response.writeHead(200, { 'Content-Type': 'application/json' })
                            response.write('{ "peaks": ' + JSON.stringify(peaks) + ' }')
                            response.end()
                        } else {
                            // fail, send the error to the client
                            response.writeHead(500, { 'Content-Type': 'application/json' })
                            response.write('{ error: ' + error + ' }')
                            response.end()
                        }

                    })

                }

                break
            case '/getTrack':

                queryObject = _parse(urlParts.query)

                //console.log(queryObject)

                if (typeof queryObject !== 'undefined' && queryObject.trackId !== 'undefined' && queryObject.trackFormat !== 'undefined') {

                    const trackName = queryObject.trackId + '.' + queryObject.trackFormat

                    if (queryObject.serverDirectory === undefined) {
                        queryObject.serverDirectory = './downloads'
                    }

                    const trackPath = queryObject.serverDirectory + '/' + trackName
                    const fileStat = statSync(trackPath)
                    let mimeType

                    switch (queryObject.trackFormat) {
                        case 'ogg':
                            mimeType = 'audio/ogg'
                            break
                        case 'mp3':
                            mimeType = 'audio/mpeg'
                            break
                    }

                    response.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': fileStat.size })

                    const readStream = createReadStream(trackPath)

                    readStream.pipe(response)

                }

                break
            default:
                response.writeHead(404, { 'Content-Type': 'text/html' })
                response.write('page not found')
                response.end()

        }
    }

})

server.listen(serverPort, serverIp, function () {
    console.log('server is listening, ip: ' + serverIp + ', port: ' + serverPort)
})