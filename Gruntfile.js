/*global module:false*/

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jslint: {
      files: [ 'Gruntfile.js', 'index.js', 'test/test-*.js' ],
      directives: {
        indent: 2,
        todo: true,
        nomen: true,
        sloppy: true,
        regexp: true,
        vars: true
      }
    },

    nodeunit: {
      files: [ 'test/test-*.js' ]
    },

    watch: {
      files: '<config:jslint.files>',
      tasks: 'jslint nodeunit'
    }

  });

  // Default task.
  grunt.registerTask('default', [ 'jslint', 'nodeunit' ]);

};
