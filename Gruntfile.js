/*global module:false*/

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [ 'Gruntfile.js', 'index.js', 'test.js' ]
    },

    nodeunit: {
      files: [ 'test.js' ]
    },

    watch: {
      files: '<config:jshint.files>',
      tasks: 'jshint nodeunit'
    }

  });

  // Default task.
  grunt.registerTask('default', [ 'jshint', 'nodeunit' ]);

};
