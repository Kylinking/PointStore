var express = require('express');
var router = express.Router();
var jwt = require('simple-jwt');
/* GET home page. */
router.post('/login', function(req, res, next) {
  shopId = req.body.ShopID || '';
  password = req.body.Password || '';
  
});

module.exports = router;
