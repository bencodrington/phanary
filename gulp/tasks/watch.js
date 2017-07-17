var gulp    = require('gulp'),
watch       = require('gulp-watch'),
browserSync = require('browser-sync').create();

gulp.task('watch', function() {

    browserSync.init({
        notify: false,  // Supresses notification on updates
        proxy: "localhost:8000"
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
        gulp.start('templatesRefresh');
    })

<<<<<<< HEAD
    watch('./public/audio/converted/*', function() {
=======
    watch('./app/assets/audio/*', function() {
>>>>>>> f2b932bba69ee7bf60ac881a73c698cccf800a68
        gulp.start('audioRefresh');
    });

});

gulp.task('cssInject', ['styles'], function() {
    return gulp.src('./public/stylesheets/style.css')
        .pipe(browserSync.stream());
});

gulp.task('scriptsRefresh', ['scripts'], function() {
    browserSync.reload();
});

gulp.task('templatesRefresh', ['templates'], function() {
    // browserSync.reload(); Not necessary, as the changed .js files will trigger scriptsrefresh
});

gulp.task('audioRefresh', function() {
    browserSync.reload();
});