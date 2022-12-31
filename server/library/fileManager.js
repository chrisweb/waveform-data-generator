import { exists as _exists, existsSync } from 'fs'

/**
 * 
 * file manager
 * 
 * @returns {fileManagerConstructor}
 */
class FileManager {

    constructor() {
    }

    /**
     *
     * check if the file exists
     *
     * @param {type} file
     * @param {type} callback
     * @returns {undefined}
     */
    exists(file, callback) {

        //console.log('file exists? file: ' + file)

        if (callback !== undefined) {

            if (file !== undefined) {

                // async exists
                _exists(file, function (exists) {
                    callback(null, exists)
                });

            } else {

                callback('file is undefined')

            }

        } else {

            if (file !== undefined) {
                return existsSync(file)
            } else {
                throw 'file is undefined'
            }

        }

    }
}

export default FileManager