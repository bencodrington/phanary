var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssvars = require('postcss-simple-vars'),
    nested = require('postcss-nested'),
    cssImport = require('postcss-import'),
    mixins = require('postcss-mixins');
hexrgba = require('postcss-hexrgba');

const compileStyles = () => {
    return gulp.src('./app/assets/styles/style.css')
        .pipe(postcss([cssImport, mixins, nested, cssvars, hexrgba, autoprefixer]))
        .on('error', function (errorInfo) {
            console.log(errorInfo.toString());
            this.emit('end'); // End task in case of css error
        })
        .pipe(gulp.dest('./public/stylesheets'));
};

module.exports = { compileStyles: compileStyles };
gulp.task('compileStyles', compileStyles);