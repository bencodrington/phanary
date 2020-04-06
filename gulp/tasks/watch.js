const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const compileStyles = require('./styles').compileStyles;
const compileScripts = require('./scripts').compileScripts;
const compileTemplates = require('./templates').compileTemplates;

const reloadBrowserSync = (done) => {
    browserSync.reload();
    done();
}

const injectStyles = () => {
    return gulp
        .src('./public/stylesheets/style.css')
        .pipe(browserSync.stream());
};

const refreshScripts = gulp.series(compileScripts, reloadBrowserSync);

const watchViews = () => {
    gulp.watch('./views/**/*.hbs', reloadBrowserSync);
};

const watchStyles = () => {
    gulp.watch('./app/assets/styles/**/*.css', gulp.series(compileStyles, injectStyles));
};

const watchScripts = () => {
    gulp.watch('./app/assets/scripts/**/*.js', refreshScripts);
};

const watchTemplates = () => {
    gulp.watch('./app/assets/templates/**/*.hbs', compileTemplates);
};

const watchAll = () => {
    browserSync.init({
        notify: false,  // supresses notification on updates
        proxy: "localhost:8080"
    });
    return gulp.parallel(
        watchViews,
        watchStyles,
        watchScripts,
        watchTemplates
    )();
};

module.exports = { watchAll: watchAll };
gulp.task('watchAll', watchAll);