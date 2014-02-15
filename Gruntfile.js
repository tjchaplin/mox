

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jshint: {
      files: ["gruntfile.js", "index.js", "lib/**/*.js","tests/**/*.js"],
      options: {
        globals: {
          console: true,
          module: true
        }
      }
    },
    release: {
      options: {
        bump: true, //default: true
        file: "package.json", //default: package.json
        add: true, 
        commit: true,
        tag: true,
        push: true,
        pushTags: true,
        npm: true
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['tests/**/*.js']
      }
    },
    watch: {
      files: ["<%= jshint.files %>"],
      tasks: ["jshint","mochaTest"]
    }
  });

  grunt.loadNpmTasks("grunt-release");
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.registerTask("deploy", ["release"]);
  grunt.registerTask("default", ["jshint","mochaTest"]);
};
