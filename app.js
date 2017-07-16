var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var sessions = require('client-sessions');

var index = require('./routes/index');
var system = require('./routes/system');

var app = express();

// View engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessions({
  cookieName: 'session',
  secret: 'sadfasdfasd45bhj2kg34jh5jkhvo87ahs',
  duration: 30 * 60 * 1000, // 30 minutes
  activeDuration: 5 * 60 * 1000, // Extend by 5 minutes if active
  httpOnly: true, // Don't let browser JS access cookies ever
  ephemeral: true // Delete this cookie when the browser is closed
}));

app.use('/', index);
app.use('/system', system);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
