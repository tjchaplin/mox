var Readable = require('stream').Readable;

module.exports = function stringToStream(string){
    var rs = new Readable();
    rs.push(string);
    rs.push(null);
    
    return rs;
};