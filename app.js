'use strict';

var path = require('path');
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
app.db = db;
app.use(bodyParser.json());
app.use(cookieParser());


app.use('/doc',express.static(__dirname+'/doc/'));
app.use('/',express.static(__dirname+'/frontend/'));
// app.get('/',(req,res)=>{
//     res.sendFile(path.resolve(__dirname+'/frontend/index.html'));
// });
// app.get('/doc',(req,res)=>{
//   res.sendFile(path.resolve(__dirname+'/doc/index.html'));
// });
//log everything in the info level 
app.all('*', function (req, res, next) {
  try {
    // 支持跨域请求
    res.append('Access-Control-Allow-Origin', '*');
    res.append("Access-Control-Allow-Methods",'POST,GET,UPDATE,PATCH,DELETE');
    res.append('Access-Control-Allow-Headers','Content-Type, TOKEN');
    res.append('Access-Control-Max-Age','86400');
    res.locals.logger = logger;
    res.locals.db = db;
    res.locals.redisClient = redisClient;
    res.locals.redis = redis;
    logger.info("=====================================================");
    logger.info(`Transaction begins at:${new Date().toLocaleString()}`)
    logger.info("=====================================================");
    logger.info(req.ip);
    logger.info(req.path);
    logger.info(req.headers);
    logger.info(req.body);
    logger.info(req.params);
  } catch (error) {
    logger.error(error);
  }
  if (req.method == 'OPTIONS') {
    res.status(200).end();  
  }else{
    next();
  }
})
app.use('/login', LoginRouter);

app.use('/api', ApiRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
   //next(createError(404));
   logger.info("NO PATH");
   res.json({Error:{Message:`找不到路径:${req.path}`}}).end();
   //next();
});
// error handler
app.use(function (err, req, res, next) {
  logger.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.json({Error:{Message:`找不到路径:${req.path}`}}).end();
  //res.status(err.status || 500).end();
  //res.render('error');
});

module.exports = app;
