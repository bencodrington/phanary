var gulp    = require('gulp'),
watch       = require('gulp-watch'),
browserSync = require('browser-sync').create();

gulp.task('watch', function() {

    browserSync.init({
        notify: false,  // supresses notification on updates
        proxy: "localhost:8080"
    });

    watch('./views/**/*.hbs', function() {
        browserSync.reload();
    });

    watch('./app/assets/styles/**/*.css', function() {
        gulp.start('cssInject');
    });

    watch('./app/assets/scripts/**/*.js', function() {
        gulp.start('scriptsRefresh');
    });

    watch('./app/assets/templates/**/*.hbs', function() {
        gulp.start('templates');
    })

});

gulp.task('cssInject', ['styles'], function() {
    return gulp.src('./public/stylesheets/style.css')
        .pipe(browserSync.stream());
});

gulp.task('scriptsRefresh', ['scripts'], function() {
    browserSync.reload();
});