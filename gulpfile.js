var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');

gulp.task('default', ['lint','test']);

gulp.task('watch', function() {
    gulp.watch(['tests/**', 'lib/**'], ["lint"])
});

gulp.task('lint', function() {
  gulp.src(['./lib/**/*.js',
            './tests/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test',function(){
    gulp.src(['tests/**/*.js'])
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', gutil.log);
});