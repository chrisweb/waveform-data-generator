// nodejs fs
var fs = require('fs');

/**
 * 
 * directory manager
 * 
 * @returns {directoryManagerConstructor}
 */
var directoryManager = function directoryManagerConstructor() {
    
};

/**
 * 
 * check if the directory exists
 * 
 * @param {type} directory
 * @param {type} callback
 * @returns {undefined}
 */
directoryManager.prototype.exists = function directoryExistsFunction(directory, callback) {
    
    //console.log('directory exists? directory: ' + directory);
    
    if (callback !== undefined) {
    
        if (directory !== undefined) {
    
            // async exists
            fs.exists(directory, function(exists) {

                callback(false, exists);

            });
            
        } else {
            
            callback('directory is undefined');
            
        }
        
    } else {
        
        if (directory !== undefined) {
        
            fs.existsSync(directory);
            
        } else {
            
            throw 'directory is undefined';
            
        }
        
    }
    
};

/**
 * 
 * create a new directory
 * 
 * @param {type} directory
 * @param {type} callback
 * @returns {undefined}
 */
directoryManager.prototype.create = function createDirectoryFunction(directory, callback) {
    
    //console.log('create directory: ' + directory);
    
    if (callback !== undefined) {
    
        fs.mkdir(directory, 0666, function(error) {

            if (!error) {

                callback(false);

            } else {

                callback(error);

            }

        });
        
    } else {
        
        return fs.mkdirSync(directory, 0666);
        
    }
    
};

module.exports.directoryManager = directoryManager;