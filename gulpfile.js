/// <binding AfterBuild='vss-sdk' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('vss-sdk', function () {
    gulp.src('./node_modules/vss-web-extension-sdk/lib/*.js')
        .pipe(gulp.dest('./wwwroot/sdk/scripts'));
    gulp.src('./node_modules/q/*.js')
        .pipe(gulp.dest('./wwwroot/sdk/scripts'));
});
