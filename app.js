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
var UserRouter = require('./controllers/routes/users');
var LoginRouter = require('./controllers/routes/login');
var ApiRouter = require('./controllers/routes/api/');
express.static.mime.define({'application/wasm':['wasm']});
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
    logger.info(req.ip);
    logger.info(req.method);
    logger.info(req.path);
    logger.info(req.headers);
    logger.info(req.body);
    logger.info(req.params);
    logger.info("=====================================================");
    //LogObject(logger,req);
  } catch (error) {
    logger.error(error);
    res.json({Error:{Message:error}}).end();
  }
  if (req.method == 'OPTIONS') {
    res.status(200).end();  
  }else{
    let contentType = req.get('Content-Type');
    if (contentType !== 'application/json'){
    //  throw "请求报文格式为JSON";
    }
    next();
  }
})
app.use('/login', LoginRouter);
app.use('/users', UserRouter);

app.use('/api', ApiRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
   throw `找不到路径:${req.path}`;
});
// error handler
app.use(function (err, req, res, next) {
  logger.error(err);
  res.json({Error:{Message:err}}).end();
});


function LogObject(logger,obj)
{
    for (let i of Object.getOwnPropertyNames(obj)){
        logger.info(`${i}:${obj.i}`);
    }
}


module.exports = app;
