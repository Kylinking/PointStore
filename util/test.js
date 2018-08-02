var db = require('../models').db;
var util = require('./util');

var shopInfo = db.ShopInfo;
var customerInfo = db.CustomerInfo;
var custacctInfo = db.CustomerAccountInfo;

(async ()=>{
    var b = await util.isBelongsTo(1,112);
      console.log(b);
})();
