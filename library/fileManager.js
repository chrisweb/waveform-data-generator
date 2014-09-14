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
    
    console.log('file exists: ' + file);
    
    if (callback !== undefined) {
    
        // async exists
        fs.exists(file, function(exists) {

            callback(false, exists);

        });
        
    } else {
        
        fs.existsSync(file);
        
    }
    
};

module.exports.fileManager = fileManager;