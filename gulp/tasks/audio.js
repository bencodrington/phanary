var gulp    = require('gulp'),
ffmpeg      = require('gulp-fluent-ffmpeg');

var dest = './temp/audio';

gulp.task('audio', function() {
    // convert files to webm
    gulp.src('./app/assets/audio/*')
        .pipe(ffmpeg('webm', function(cmd) {
            return cmd;
        }))
        .pipe(gulp.dest(dest));
    // convert files to mp3
    gulp.src('./app/assets/audio/*')
        .pipe(ffmpeg('mp3', function(cmd) {
            return cmd;
        }))
        .pipe(gulp.dest(dest));
});