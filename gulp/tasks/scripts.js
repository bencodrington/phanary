var gulp = require('gulp'),
webpack = require('webpack');

gulp.task('scripts', function(callback) {
    webpack(require('../../webpack.config.js'), function(err, stats) {
        if (err) {
            console.log(err.toString());
        }
        console.log(stats.toString());
        callback();
    });
    gulp.src(['./app/assets/scripts/**/*.js',
        '!./app/assets/scripts/modules/*.js'])   // module files not required in dist build
        .pipe(gulp.dest('./public/scripts'));
});