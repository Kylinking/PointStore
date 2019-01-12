'use strict';

var express = require('express');
var router = express.Router();
let Utility = require('../../../../classes/utility');
let Auth = require('../../../../classes/auth');
router.post('/token', async function (req, res, next) {
  let logger = res.locals.logger;
  logger.info('POST /token');
  let phone = req.body.phone || '';
  let username = req.body.username || '';
  username = phone;
  let password = req.body.password || '';
  logger.info(`username:${username},password:${password}`);
  if (username == '' || password == '') {
    logger.warn("用户名、密码为空");
    res.status(403).json(Utility.MakeErrorResponse({
      id: 0,
      detail: "用户名、密码不能为空"
    }).content).end();
    return;
  } else {
    let auth = new Auth(username, password);
    let response = await auth.Login();
    res.status(response.status).json(response.content).end();
  }
});

router.post('/refresh', async function (req, res, next) {
  let logger = res.locals.logger;
  logger.info('POST /refresh');
  let auth = new Auth();
  let response = auth.Refresh(req.body);
  res.status(response.status).json(response.response).end();
});
router.use('/', (req, res, next) => {
  next();
})

router.use('/', (err, req, res, next) => {
  next(err);
})

module.exports = router;