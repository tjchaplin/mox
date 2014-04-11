var fs = require('fs.extra');
var dox = require("dox");
var jade = require('jade');
var path = require('path');
var dir = require('node-dir');
var assert = require('assert');
var concat = require('concat-stream');
var hammerdown = require('hammerdown');
var yaenumerable = require('yaenumerable');


var run = function(sources,options,onComplete){
    var self = this;

    if(options instanceof Function){
        if(!onComplete){
            onComplete  = options;
            template = {};
        }
    }

    if(!(sources instanceof Array))
        sources = [sources];

    assert(sources, "Sources must be defined");
    assert(sources.length > 0, "Must provide at least one source");

    var template = resolveTemplate(options.template);

    var regex = /(?:\.([^.]+))?$/;
    var engine = regex.exec(template)[1];

    var file = fs.readFileSync(template, 'ascii');

    getAllFilesToParse(sources,function(sources){

        var documentation = parseSources(sources);

        if(options.name)
            documentation.name = options.name;

        if(options.version)
            documentation.version = options.version;

        var jadeRenderer = jade.compile(file);
        var rendered = jadeRenderer(documentation);

        if(options.moxFile)
            fs.outputFileSync(options.moxFile,JSON.stringify(documentation,null, 4));

        if(options.htmlFile)
            fs.outputFileSync(options.htmlFile,rendered);

        hammerdown({type:'gfm'}).parse(rendered).pipe(concat(function(markdown){
            if(options.outputFile)
                fs.outputFileSync(options.outputFile,markdown);

            if(onComplete instanceof Function)
                onComplete(markdown);
        }));
    });
};

var getAllFilesToParse = function(sources, onAllFiles){
    var allSources = [];

    var onEachSource = function(source,onComplete){

        if(!fs.lstatSync(source).isDirectory()){
            allSources.push(source);
            onComplete();
            return;
        }

        dir.paths(source, function(err, paths) {
            if (err) throw err;

            for (var i = 0; i < paths.files.length; i++) {
                allSources.push(paths.files[i]);
            }

            onComplete();
        });
    };

    yaenumerable.fromArray(sources)
                .asyncForEach(onEachSource,
                          function(){
                            onAllFiles(allSources);
                        });
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
                                            return comment.ignore === true ? {} : doxToMoxComment(comment);
                                        }).toArray();
    return transformedComments;
};

var doxToMoxComment = function(doxComment){
    if(doxComment.ignore) { return; }
    var transformedComment = {
        params : [],
        name : doxComment.ctx ? doxComment.ctx.name : '',
        type : doxComment.ctx ? doxComment.ctx.type : '',
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