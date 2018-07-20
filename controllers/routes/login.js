var express = require('express');
var router = express.Router();
var logins = require('../../models/login');
var redisClient = require('../../models/index').redisClient;
var redis = require('redis');
var jwt = require('jwt-simple');
/* Login in */

router.post('/', function(req, res, next) {
  res.locals.logger.info('enter post /login"');
  let shopID = req.body.ShopID || '';
  let password = req.body.Password || '';
  if (shopID == '' || password == ''){
      res.locals.logger.warn("用户名、密码为空");      
      res.json({error:{message:"用户名、密码不能为空"}}).end();
  }else{
    logins.findOne({ where: {ShopID: shopID} }).then(login => {
      if (login == null){
        res.locals.logger.warn(shopID + ": 用户不存在");
        res.json({error:{message:"用户不存在"}}).end();
      }else if(login.dataValues.Password !== password){
        res.locals.logger.warn(shopID + ": 密码错误");
        res.json({error:{message:"密码错误"}}).end();
      }else{
        var token = jwt.encode({
            iss:shopID
        },'SomeSecret');
        redisClient.set(String(shopID),token);
        redisClient.expire(String(shopID),8*3600);
        res.locals.logger.info(shopID+": 登录成功");
        res.json({data:{message:"Login Success!",token:token}}).end();
      }
    }).then(()=>{
      res.locals.logger.info("exit post /login")
    })
  }  
});



module.exports = router;
