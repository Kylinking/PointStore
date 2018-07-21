'use strict';

var createError = require('http-errors');
var express = require('express');
var db = require('./models').db;
var redisClient = require('./models').redisClient;
var redis = require('redis');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('./log/');
var LoginRouter = require('./controllers/routes/login');
var ApiRouter = require('./controllers/routes/api/');

var app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: false
// }));
app.use(cookieParser());
//app.use('*',preAction);

//log everything in the info level 
app.all('*', function (req, res, next) {
  try{
  res.locals.logger = logger;
  res.locals.db = db;
  res.locals.redisClient = redisClient;
  res.locals.redis = redis;
  logger.info('ip:' + req.ip +
    ' path:' + req.path +
    ' headers:' + req.headers +
    ' body:' + req.body + 
    ' params:' + req.params);
  }catch(error){
    console.log(error);
  }
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

const developMode = require('./config/global.json').develop;
if (developMode == true){
  db.sequelize.sync({force:true}).then(()=>{
      require('./test/test.js')(db);
  });
}
module.exports = app;
