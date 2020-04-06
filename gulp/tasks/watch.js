const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const compileStyles = require('./styles').compileStyles;
const compileScripts = require('./scripts').compileScripts;

const initBrowserSync = () => {
    browserSync.init({
        notify: false,  // supresses notification on updates
        proxy: "localhost:8080"
    });
}

const reloadBrowserSync = () => {
    browserSync.reload();
}

const injectStyles = () => {
    return gulp.series(compileStyles, () => {
        return gulp
            .src('./public/stylesheets/style.css')
            .pipe(browserSync.stream());
    });
};

const refreshScripts = () => {
    return gulp.series(compileScripts, reloadBrowserSync);
};

const watchViews = () => {
    gulp.watch('./views/**/*.hbs', reloadBrowserSync);
};

const watchStyles = () => {
    gulp.watch('./app/assets/styles/**/*.css', injectStyles);
};

const watchScripts = () => {
    gulp.watch('./app/assets/scripts/**/*.js', refreshScripts);
};

const watchTemplates = () => {
    gulp.watch('./app/assets/templates/**/*.hbs', () => { gulp.start('templates'); });
};

const watchAll = () => {
    return gulp.series(
        initBrowserSync,
        gulp.parallel(
            watchViews,
            watchStyles,
            watchScripts,
            watchTemplates
        ),
    )();
};

module.exports = { watchAll: watchAll };
gulp.task('watchAll', watchAll);