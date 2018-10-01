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
  let shopId = req.body.ShopId || '';
  let password = req.body.Password || '';
  let db = res.locals.db;
  let redisClient = res.locals.redisClient;

  if (shopId == '' || password == '') {
    logger.warn("用户名、密码为空");
    res.json({
      Error: {
        Message: "用户名、密码不能为空"
      }
    }).end();
    return;
  }  
  
  else {
    db.Login.findOne({
      where: {
        Id: shopId
      }
    }).then(login => {
      if (login == null) {
        logger.warn(shopId + ": 用户不存在");
        res.json({
          Error: {
            Message: "用户不存在"
          }
        }).end();
      } else {
        // if (login.Status != 1) {
        //   logger.warn(shopId + "状态不正常");
        //   res.json({
        //     Error: {
        //       Message: `店面状态不正常 Status:${login.Status}`
        //     }
        //   }).end();
        //   return;
        // }
        if (login.dataValues.Password !== password) {
          logger.warn(shopId + ": 密码错误");
          res.json({
            Error: {
              Message: "密码错误"
            }
          }).end();
          return;
        }

        var token = jwt.encode({
          shopid: shopId
        }, jwtSecret);
        redisClient.set(String(shopId), token);
        redisClient.expire(String(shopId), expireTime);
        logger.info(shopId + ": 登录成功");
        res.json({
          Data: {
            Message: "Login Success!",
            Token: token
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
    Error: {
      Message: "No Service with " + req.method
    }
  }).end();
})
module.exports = router;
