var gulp = require('gulp');
var exec = require('child_process').exec;
var commands = [
    "handlebars app/assets/templates/searchResult.hbs -f app/assets/scripts/modules/templates/searchResult.js",
    "handlebars app/assets/templates/atmosphere.hbs -f app/assets/scripts/modules/templates/atmosphere.js",
    "handlebars app/assets/templates/track.hbs -f app/assets/scripts/modules/templates/track.js",
    "handlebars app/assets/templates/oneshot.hbs -f app/assets/scripts/modules/templates/oneshot.js"
];

const compileTemplates = async () => {
    commands.forEach(function (cmd) {
        exec(cmd, function (error, stdout, stderr) {
            console.log("Running: \'" + cmd + "\'");
            if (stdout) {
                console.log("Output:\n" + stdout);
            }
            if (stderr) {
                console.log("Error:\n" + stderr);
            }
        });
    });
};

module.exports = { compileTemplates };
gulp.task('compileTemplates', compileTemplates);