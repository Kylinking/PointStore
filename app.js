var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('./log/log');
var LoginRouter = require('./routes/login');
var ApiRouter = require('./routes/api');
//var PreAction = require('./routes/preaction');
var app = express();


//app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
//app.use('*',preAction);
// 
app.all('*', function (req, res, next) {
  res.locals.logger = logger;
  logger.info('ip:' + req.ip);
  logger.info('path:' + req.path);
  logger.info('headers:' + req.headers);
  logger.info('body:' + req.body);
  logger.info('params:' + req.params);
  next();
})

app.use('/login', LoginRouter);

app.use('/api', ApiRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;
