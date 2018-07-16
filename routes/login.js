var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  //console.log('here');
  res.locals.logger.info('login.js enter');
  //res.render('index', { title: 'Express' });
  res.end('hello');
  res.locals.logger.info('login.js end');  
});

module.exports = router;
