var gulp = require('gulp');
wrap = require('gulp-wrap'),
declare = require('gulp-declare'),
handlebars = require('gulp-handlebars'),
concat = require('gulp-concat');

gulp.task('templates', function() {
    // return gulp.src('./app/assets/templates/**/*.hbs')
    //     .pipe(handlebars({
    //         handlebars: require('handlebars')
    //     }))
    //     .pipe(wrap('Handlebars.template(<%= contents %>)'))
    //     .pipe(declare({
    //         namespace: 'Handlebars.templates',
    //         noRedeclare: true, // Avoid duplicate declarations
    //     }))
    //     .pipe(concat('templates.js'))
    //     .pipe(gulp.dest('./app/assets/scripts/modules/templates'));
});

// TODO:
// handlebars app/assets/templates/searchResult.hbs -f app/assets/scripts/modules/templates/searchResult.js