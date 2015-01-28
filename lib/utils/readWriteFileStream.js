var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var through = require('through');

module.exports =  function(filePath){
	mkdirp.sync(path.dirname(filePath));
	var writeStream = fs.createWriteStream(filePath,{ flags: 'w'});

	return through(function(buffer){
		writeStream.write(buffer);
		this.push(buffer);
	},function(){
		var self = this;
		writeStream.on('finish',function(){
			self.push(null);
		});
		writeStream.end();
	});	
};
