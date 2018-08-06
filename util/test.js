var db = require('../models').db;
var util = require('./util');

var shopInfo = db.ShopInfo;
var customerInfo = db.CustomerInfo;
var custacctInfo = db.CustomerAccountInfo;


var phone = 144444;
var recharged = 100;
var cost = 20;
var bounus = 20;
var r1,r2,r3;
// db.sequelize.transaction(t => {
//     return db.CustomerInfo.findOne({
//         where: {
//             Phone: phone,
//         },
//     }, {transaction:t})
//     .then(async (row)=>{
//         r1 = row;
//        r2 = await r1.getRecommendCustomerInfo({attributes: ['Name']});
//        r3 = await r2.getRecommendCustomerInfo({attributes: ['CustomerID']})

//     });    // Committed
// }).then(()=>{
//     console.log('commit success');
// })
// .catch(error=>{
//     console.log(error);
// })
(async function(){
    console.log(await util.isAdminShop("11a2"));
})()
