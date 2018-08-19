'use strict';

var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var jwtSecret = require('../../config/global.json').jwtSecret;
//TODO: Take expire time
const expireTime = 8 * 3600; //seconds

// Login in
router.post('/', function (req, res, next) {
  let logger = res.locals.logger;
  logger.info('enter post /login"');
  let shopID = req.body.ShopID || '';
  let password = req.body.Password || '';
  let db = res.locals.db;
  let redisClient = res.locals.redisClient;

  if (shopID == '' || password == '') {
    logger.warn("用户名、密码为空");
    res.json({
      error: {
        message: "用户名、密码不能为空"
      }
    }).end();
  } else {
    db.Login.findOne({
      where: {
        ID: shopID
      }
    }).then(login => {
      if (login == null) {
        logger.warn(shopID + ": 用户不存在");
        res.json({
          error: {
            message: "用户不存在"
          }
        }).end();
      } else if (login.dataValues.Password !== password) {
        logger.warn(shopID + ": 密码错误");
        res.json({
          error: {
            message: "密码错误"
          }
        }).end();
      } else {
        var token = jwt.encode({
          ShopID: shopID
        }, jwtSecret);
        redisClient.set(String(shopID), token);
        redisClient.expire(String(shopID), expireTime);
        logger.info(shopID + ": 登录成功");
        res.json({
          data: {
            message: "Login Success!",
            token: token
          }
        }).end();
      }
    }).then(() => {
      logger.info("exit post /login")
    })
  }
});

router.use('/', (req, res) => {
  res.json({
    error: {
      message: "No Service with " + req.method
    }
  }).end();
})
module.exports = router;
