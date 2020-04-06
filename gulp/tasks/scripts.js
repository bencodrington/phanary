var gulp = require('gulp');
var webpack = require('webpack');

const compileScripts = (callback) => {
    webpack(require('../../webpack.config.js'), function (err, stats) {
        if (err) {
            console.log(err.toString());
        }
        console.log(stats.toString());
        callback();
    });
    gulp.src(['./app/assets/scripts/**/*.js',
        '!./app/assets/scripts/modules/*.js'])   // module files not required in dist build
        .pipe(gulp.dest('./public/scripts'));
};

module.exports = { compileScripts:compileScripts };
gulp.task('compileScripts', compileScripts);