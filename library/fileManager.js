// nodejs fs
var fs = require('fs');

/**
 * 
 * file manager
 * 
 * @returns {fileManagerConstructor}
 */
var fileManager = function fileManagerConstructor() {
    
};

/**
 * 
 * check if the file exists
 * 
 * @param {type} file
 * @param {type} callback
 * @returns {undefined}
 */
fileManager.prototype.exists = function fileExistsFunction(file, callback) {
    
    //console.log('file exists? file: ' + file);
    
    if (callback !== undefined) {
    
        if (file !== undefined) {
    
            // async exists
            fs.exists(file, function(exists) {

                callback(false, exists);

            });
            
        } else {
            
            callback('file is undefined');
            
        }
        
    } else {
        
        if (file !== undefined) {
        
            return fs.existsSync(file);
            
        } else {
            
            throw 'file is undefined';
            
        }
        
    }
    
};

module.exports.fileManager = fileManager;