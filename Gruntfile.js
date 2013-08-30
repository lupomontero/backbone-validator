/*global module:false*/

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [ 'Gruntfile.js', 'index.js', 'test.js' ]
    },

    nodeunit: {
      files: [ 'test.js' ]
    },

    uglify: {
      min: {
        files: {
          'backbone-validator-min.js': [ 'index.js' ]
        }
      }
    }

  });

  // Default task.
  grunt.registerTask('default', [ 'jshint', 'nodeunit', 'uglify' ]);

};
