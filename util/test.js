var db = require('../models').db;
var util = require('./util');

var shopInfo = db.ShopInfo;
var customerInfo = db.CustomerInfo;
var custacctInfo = db.CustomerAccountInfo;

custacctInfo.findAll({
    include:[
        {
            model:customerInfo,
            as: 'CustomerID',
            where:{},
            include:[
                {
                    model:shopInfo,
                    where:{
                        ParentShopID:11
                    }
                }
            ]
        }
    ]
}).then(rows=>{
    
    rows.forEach(row=>{
        console.log(row);
    })
    console.log(rows.length);
}).catch(err=>{
    console.log(err);
})


