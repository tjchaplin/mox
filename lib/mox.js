var jade = require('jade'),
    fs = require('fs'),
    dox = require("dox"),
    md = require('html-md'),
    yaenumerable = require('yaenumerable');

var run = function(source,dest,templatePath){

    var regex = /(?:\.([^.]+))?$/;
    var engine = regex.exec(templatePath)[1];

    var filenames = source;
    var file = fs.readFileSync(templatePath, 'ascii');
    var documentation = parseSources(filenames);
    
    var jadeRenderer = jade.compile(file);
    var rendered = jadeRenderer(documentation);     

    var markdown = md(rendered);

    fs.writeFileSync(dest,markdown);
};

var parseSources = function(sourceFilenames){

    var allSourceComments = parseAllSourceComments(sourceFilenames);

    var moxComments = transformToMoxComments(allSourceComments);
    var categories = getDistinctTagValues('category',moxComments);

    return {
        comments : allSourceComments,
        mox : moxComments,
        categories : categories
    };
};

var parseAllSourceComments = function(sourceFilenames,onComplete){
    var allSourceComments = [];


    for(var i=0; i<sourceFilenames.length; i++){
        if(!sourceFilenames[i].match(/.js$/))
            continue;

        var fileName = sourceFilenames[i];

        var jsfile = fs.readFileSync(fileName, 'ascii');
        var comments = dox.parseComments(jsfile);

        for(var j=0; j<comments.length; j++){
            comments[j].fileName = fileName;
        }
        allSourceComments = allSourceComments.concat(comments);
    }

    return allSourceComments;
};


var transformToMoxComments = function(sourceComments){
    var distinctTags = [];

    var transformedComments = yaenumerable.fromArray(sourceComments)
                                        .select(function(comment){
                                            return transformComment(comment);
                                        }).toArray();
    return transformedComments;
};

var transformComment = function(doxComment){

    var transformedComment = {
        name : doxComment.ctx.name,
        type : doxComment.ctx.type,
        description : doxComment.description,
        params : []
    };
     
    yaenumerable.fromArray(doxComment.tags)
                .forEach(function(tag){
                    
                    if(tag.string)
                        transformedComment[tag.type] = tag.string;
                    else if(tag.string === '')
                        transformedComment[tag.type] = true;
                    else if(tag.type === 'param'){
                        transformedComment.params.push(getTagAttributes(tag));
                    }
                    else{
                        transformedComment[tag.type] = getTagAttributes(tag);
                    }
                });

    return transformedComment;
}

var getTagAttributes = function(tag){
    var tagAttributes = {};
    
    for (var tagAttribute in tag) {
        if(tagAttribute === 'type')
            continue;
        
        tagAttributes[tagAttribute] = tag[tagAttribute];            

    }
    return tagAttributes;
}

var getDistinctTagValues = function(tagName,moxComments){
    return  yaenumerable.fromArray(moxComments)
                        .where(function(comment){ 
                            if(comment[tagName])
                                return true;

                            return false;
                        })
                        .distinct(function(comment){return comment.category;},
                                function(comment){return comment;})
                        .select(function(comment){
                            
                            for(var distinct in comment){
                                return {tag : distinct,
                                        moxComments : comment[distinct]
                                    };
                            }
                            return {};
                        })
                        .toArray();
};


module.exports.run = run;

// (function(){
//     run(['../scarlet/lib/scarlet.js'],'./test.html','../scarlet/template.jade');
// })();