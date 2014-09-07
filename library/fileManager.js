// nodejs fs
var fs = require('fs');

/**
 * 
 * @returns {fileManagerConstructor}
 */
var fileManager = function fileManagerConstructor() {
    
};

/**
 * 
 * does the file exist
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