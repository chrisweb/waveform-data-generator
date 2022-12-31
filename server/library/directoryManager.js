import { exists as _exists, existsSync, mkdir, mkdirSync } from 'fs'

class DirectoryManager {

    constructor() {
    }

    /**
     *
     * check if the directory exists
     *
     * @param {type} directory
     * @param {type} callback
     * @returns {undefined}
     */
    exists(directory, callback) {

        //console.log('directory exists? directory: ' + directory)

        if (callback !== undefined) {

            if (directory !== undefined) {

                // async exists
                _exists(directory, function (exists) {
                    callback(null, exists)
                })

            } else {
                callback('directory is undefined')
            }

        } else {

            if (directory !== undefined) {
                existsSync(directory)
            } else {
                throw 'directory is undefined'
            }

        }

    }
    /**
     *
     * create a new directory
     *
     * @param {type} directory
     * @param {type} callback
     * @returns {undefined}
     */
    create(directory, callback) {

        //console.log('create directory: ' + directory)

        if (callback !== undefined) {

            mkdir(directory, 666, function (error) {

                if (!error) {
                    callback(null)
                } else {
                    callback(error)
                }

            })

        } else {

            return mkdirSync(directory, 666)

        }

    }
}

export default DirectoryManager