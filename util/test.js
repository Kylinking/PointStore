//var db = require('../models').db;
var util = require('./util');

// var shopInfo = db.ShopInfo;
// var customerInfo = db.CustomerInfo;
// var custacctInfo = db.CustomerAccountInfo;


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
//        r3 = await r2.getRecommendCustomerInfo({attributes: ['CustomerId']})

//     });    // Committed
// }).then(()=>{
//     console.log('commit success');
// })
// .catch(error=>{
//     console.log(error);
// }
async function sendRechargeMessage(name,shop,recharge,remainMoney,remainPoints){
    let param = JSON.stringify({name,shop,recharge,remainMoney,remainPoints});
    console.log(param);
}
sendRechargeMessage('xiao','dian',1,2,3);