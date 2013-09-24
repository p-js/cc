/*global module */
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            folder: ["dist/*", "build/*"]
        },
        uglify: {
            all: {
                files: {
                    "dist/<%= pkg.name %>.min.js": "dist/<%= pkg.name %>.js"
                }
            }
        },
        jshint: {
            devel: {
                options: {
                    asi: false,
                    browser: true,
                    devel: true,
                    debug: true
                },
                src: ['src/*.js']
            },
            release: {
                options: {
                    browser: true
                },
                src: ['src/*.js']
            }
        },
        rig: {
            all: {
                files: {
                    "dist/<%=pkg.name%>.js": "src/<%=pkg.name%>.js"
                }
            }
        },
        bump: {
            files: ['package.json', 'bower.json']
        },
        copy: {
            build: {
                src: "dist/**/*",
                dest: 'build/<%= grunt.config("dirname") %><%= pkg.version %><%= grunt.config("buildNumber") %>/',
                flatten: true,
                expand: true

            }
        },
        watch: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            tasks: ['default']
        }
    });
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bumpx');
    grunt.registerTask('dirname', 'run before release task: set a subdirectory name, result will be build/subdirectory(s)', function(dir) {
        grunt.config("dirname", dir.lastIndexOf("/") !== dir.length - 1 ? dir + "/" : dir);
    });
    grunt.registerTask('buildNumber', 'run before release task: append a build number to the build', function(buildNumber) {
        grunt.config("buildNumber", "-" + buildNumber);
    });
    grunt.registerTask('default', ['clean', 'jshint:devel', 'rig']);
    grunt.registerTask('release', ['clean', 'jshint:devel', 'rig', 'uglify', 'copy']);
};