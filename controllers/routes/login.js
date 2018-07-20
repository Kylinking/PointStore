var express = require('express');
var router = express.Router();
var logins = require('../../models/login');
var client = require('../../models/index').redisClient;
var redis = require('redis');
var jwt = require('jwt-simple');
/* Login in */

router.post('/', function(req, res, next) {
  res.locals.logger.info('login.js enter');
  let shopID = req.body.ShopID || '';
  let password = req.body.Password || '';
  if (shopID == '' || password == ''){
      res.json({error:{message:"用户名、密码不能为空"}}).end();
  }else{
    logins.findOne({ where: {ShopID: shopID} }).then(login => {
      if (login == null){
        res.json({error:{message:"用户不存在"}}).end();
      }else if(login.dataValues.Password !== password){
        res.json({error:{message:"密码错误"}}).end();
      }else{
        var token = jwt.encode({
            iss:shopID
        },'SomeSecret');
        client.set(String(shopID),token);
        client.expire(String(shopID),50);
        res.json({data:{message:"Login Success!",token:token}}).end();
      }
    }).then(()=>{
      res.locals.logger.info(String(shopID));
      client.get(String(shopID),function(err,reply){
        if(reply){
          res.locals.logger.info(reply);
        }
      })
    })
  }
  
});



module.exports = router;
