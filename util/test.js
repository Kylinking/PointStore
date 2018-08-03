var db = require('../models').db;
var util = require('./util');

var shopInfo = db.ShopInfo;
var customerInfo = db.CustomerInfo;
var custacctInfo = db.CustomerAccountInfo;

(async (phone,shopId)=>{
    console.log(await util.isBelongsTo(phone,shopId));
})(111111,1);


