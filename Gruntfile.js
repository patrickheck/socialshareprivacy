module.exports = function(grunt) {
 
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'jquery.socialshareprivacy.js', 'test/socialshareprivacy_test.js']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: true
      },
      build: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      all: {
        options: {
          urls: ['1.7.0', '1.8.0', '1.9.0', '1.10.2', '1.11.0', '2.0.3', '2.1.0'].map(function(version) {
            return 'http://localhost:<%= connect.server.options.port %>/test/socialshareprivacy.html?jquery=' + version;
          })
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8085 // This is a random port, feel free to change it.
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  
  grunt.registerTask('default', ['jshint', 'connect', 'qunit','uglify']);
 
  grunt.registerTask('test', ['jshint', 'connect', 'qunit']);
};
