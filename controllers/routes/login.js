'use strict';

var express = require('express');
var router = express.Router();
let Unility = require('../../classes/utility');
let Auth = require('../../classes/auth');
router.post('/', async function (req, res, next) {
  let logger = res.locals.logger;
  logger.info('POST /login');
  let phone = req.body.phone || '';
  let username = req.body.username || '';
  username = phone;
  let password = req.body.password || '';
  logger.info(`username:${username},password:${password}`);
  if (username == '' || password == '') {
    logger.warn("用户名、密码为空");
    res.status(403).json(Unility.MakeErrorResponse({
      id: 0,
      detail: "用户名、密码不能为空"
    })).end();
    return;
  } else {
    let auth = new Auth(username, password);
    let response = await auth.Login();
    if (response.success) {
      res.status(200).json(response.response).end();
    } else {
      res.status(403).json(response.response).end();
    }
  }
});

router.use('/', (req, res) => {
  res.json({
    Error: {
      Message: "No Service with " + req.method
    }
  }).end();
})

router.use('/', (err, req, res, next) => {
  next(err);
})

module.exports = router;