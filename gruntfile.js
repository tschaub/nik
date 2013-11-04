

/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var gruntfileSrc = 'gruntfile.js';
  var libSrc = 'lib/**/*.js';

  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: gruntfileSrc
      },
      lib: {
        src: libSrc
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('test', ['newer:jshint']);

  grunt.registerTask('default', 'test');

};
