var jade = require('jade'),
    fs = require('fs'),
    dox = require("dox"),
    md = require('html-md');

var getDistinctTagValues = function(tagName,comments){
    var distinctTags = [];
    var tagHash = {};

    for(var i=0; i<comments.length; i++){

        var tags = comments[i].tags;
        for (var j=0; j < tags.length; j++) {
            if(tags[j].type === tagName){
                if(!(tagHash[tags[j].string] instanceof Array))
                    tagHash[tags[j].string] = [];

                tagHash[tags[j].string].push(comments[i].ctx.name);
            }
        };
    }

    for(var x in tagHash){
        distinctTags.push({
            name:x,
            attributes:tagHash[x]
        });
    }

    return distinctTags;
};

var parseSources = function(sourceFilenames){
    var allComments = [];
    
    for(var i=0; i<sourceFilenames.length; i++){
        if(!sourceFilenames[i].match(/.js$/))
            continue;

        var fileName = sourceFilenames[i];

        var jsfile = fs.readFileSync(fileName, 'ascii');
        var comments = dox.parseComments(jsfile);

        for(var j=0; j<comments.length; j++){
            comments[j].fileName = fileName;
        }
        allComments = allComments.concat(comments);
    }

    var categories = getDistinctTagValues('category',allComments);

    return {
        comments:allComments,
        categories:categories
    };
};

var run = function(source,dest,templatePath){

    var re = /(?:\.([^.]+))?$/;
    var engine = re.exec(templatePath)[1];

    var filenames = source;

    var file = fs.readFileSync(templatePath, 'ascii');

    var documentation = parseSources(filenames)

    var fn = jade.compile(file);
    var rendered = fn(documentation);     

    var markdown = md(rendered);

    fs.writeFileSync(dest,markdown);
};

module.exports = run;

(function(){
    run(['../scarlet/lib/scarlet.js'],'./test.html','../scarlet/template.jade');
})();