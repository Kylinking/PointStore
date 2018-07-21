'use strict';

var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');

//TODO: Take expire time
const expireTime = 8*3600 //seconds

// Login in
router.post('/', function(req, res, next) {  
  let shopID = req.body.ShopID || '';
  let password = req.body.Password || '';
  let db = res.locals.db;
  let redisClient = res.locals.redisClient;
  let logger = res.locals.logger;
  logger.info('enter post /login"');
  if (shopID == '' || password == ''){
      logger.warn("用户名、密码为空");      
      res.json({error:{message:"用户名、密码不能为空"}}).end();
  }else{
    db.Login.findOne({ where: {ID: shopID} }).then(login => {
      if (login == null){
        logger.warn(shopID + ": 用户不存在");
        res.json({error:{message:"用户不存在"}}).end();
      }else if(login.dataValues.Password !== password){
        logger.warn(shopID + ": 密码错误");
        res.json({error:{message:"密码错误"}}).end();
      }else{
        var token = jwt.encode({
            iss:shopID
        },'SomeSecret');
        redisClient.set(String(shopID),token);
        redisClient.expire(String(shopID),expireTime);
        logger.info(shopID+": 登录成功");
        res.json({data:{message:"Login Success!",token:token}}).end();
      }
    }).then(()=>{
      logger.info("exit post /login")
    })
  }  
});

module.exports = router;
