/*global module */
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			folder: ["dist/*", ".build"]
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
			options: {
				processContent: true,
				data: {
					build: '<%= grunt.template.today("mm/dd/yyyy hh:MM:ss TT") %>'
				}
			},
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
			test: {
				src: "test/**/*",
				dest: "dist/"
			},
			components: {
				src: "components/**/*",
				dest: "dist/test/"
			}
		},
		push_svn: {
			options: {
				trymkdir: true,
				remove: false
			},
			release: {
				src: "./dist",
				dest: '<%= grunt.config("svnDir") %>/<%= pkg.version %><%= grunt.config("buildNumber") %>',
				tmp: './.build'
			}
		},
		watch: {
			files: ['Gruntfile.js', 'src/**/*.js', "test/**/*"],
			tasks: ['default']
		}
	});
	grunt.registerTask('deploy', 'deploy to svn', function() {
		grunt.config("svnDir", grunt.option("dir"));
		if (grunt.option("build")) {
			grunt.config("buildNumber", "-" + grunt.option("build"));
		}
		grunt.task.run("push_svn");
	});
	grunt.loadNpmTasks('grunt-rigger');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks("grunt-push-svn");
	grunt.loadNpmTasks('grunt-bumpx');
	grunt.registerTask('default', ['clean', 'jshint:devel', 'rig', 'copy']);
	grunt.registerTask('release', ['clean', 'jshint:devel', 'rig', 'uglify', 'copy']);
};