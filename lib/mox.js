var fs = require('fs.extra'),
    dox = require("dox"),
    jade = require('jade'),
    path = require('path'),
    md = require('html-md'),
    assert = require('assert'),
    yaenumerable = require('yaenumerable');

var run = function(sources,dest,template){

    assert(sources, "Sources must be defined");
    assert(dest, "Destination file must be defined");

    if(!(sources instanceof Array))
        sources = [sources];

    template = resolveTemplate(template);

    var regex = /(?:\.([^.]+))?$/;
    var engine = regex.exec(template)[1];

    var filenames = sources;
    var file = fs.readFileSync(template, 'ascii');
    var documentation = parseSources(filenames);
    
    var jadeRenderer = jade.compile(file);
    var rendered = jadeRenderer(documentation);     

    var markdown = md(rendered);

    fs.outputFileSync(dest,markdown);
};

var resolveTemplate = function(template){

    if(!template)
        return path.resolve(__dirname+"/templates/", 'default.jade');

    var moxTemplate = path.resolve(__dirname+"/templates/", template+".jade");

    if(fs.existsSync(moxTemplate))
        return moxTemplate;

    return template;
};

var parseSources = function(sourceFilenames){

    var allSourceComments = parseAllSourceComments(sourceFilenames);

    var moxComments = transformToMoxComments(allSourceComments);
    var categories = getDistinctTagValues('category',moxComments);
    var files = getDistinctTagValues('fileName',moxComments);

    return {
        comments : allSourceComments,
        mox : moxComments,
        categories : categories,
        files : files
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
                                            return doxToMoxComment(comment);
                                        }).toArray();
    return transformedComments;
};

var doxToMoxComment = function(doxComment){

    var transformedComment = {
        params : [],
        name : doxComment.ctx.name,
        type : doxComment.ctx.type,
        fileName : doxComment.fileName,
        description : doxComment.description
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
};

var getTagAttributes = function(tag){
    var tagAttributes = {};
    
    for (var tagAttribute in tag) {
        if(tagAttribute === 'type')
            continue;
        
        tagAttributes[tagAttribute] = tag[tagAttribute];            

    }
    return tagAttributes;
};

var getDistinctTagValues = function(tagName,moxComments){
    return  yaenumerable.fromArray(moxComments)
                        .where(function(comment){ 
                            if(comment[tagName])
                                return true;

                            return false;
                        })
                        .distinct(function(comment){return comment[tagName];},
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