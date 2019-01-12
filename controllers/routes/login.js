'use strict';

var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var jwtSecret = require('../../config/global.json').jwtSecret;
var redisClient = require('../../models').redisClient;
const expireTime = 60000; //seconds
const expireCount = 5;
let User = require('../../classes/user');
// Login in
router.post('/', async function (req, res, next) {
  let logger = res.locals.logger;
  logger.info('POST /login');
  let username = req.body.Username || '';
  let password = req.body.Password || '';
  logger.info(`username:${username}`);
  if (username == '' || password == '') {
    logger.warn("用户名、密码为空");
    next("用户名、密码不能为空");
    return;
  } else {
    let user = await new User(username);
    await user.InitAsync();
    if (!user.isExist) {
      logger.error(username + ": 用户不存在");
      next('用户不存在');
    } else {
      if (!user.CheckPassword(password)) {
        logger.warn(username + ": 密码错误");
        next('密码错误');
        return;
      }
      let date = Date.parse(new Date());
      let token = GenerateToken({date,user},jwtSecret);
      CacheTimestamp(date,expireTime);
      logger.info(username + ": 登录成功");
      res.json({
        Object: {
          Token: token
        }
      }).end();
    }
  }
});


// api入口处需重新生成token并令现有的token过期
function GenerateToken(params,jwtSecret)
{
  const {user,date} = {...params};
  return jwt.encode({
    user: user.toJSON(),
    timeStamp: date
  }, jwtSecret);
}

function CacheTimestamp(date,expireTime){
  redisClient.set(String(date), expireCount);
  redisClient.expire(String(date), expireTime);
}

router.use('/', (req, res) => {
  res.json({
    Error: {
      Message: "No Service with " + req.method
    }
  }).end();
})

router.use('/',(err,req,res,next)=>{
  next(err);
})

module.exports = router;
