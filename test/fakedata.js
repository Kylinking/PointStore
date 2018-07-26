'use strict';

module.exports = async (models)=>{
   await models.Login.create({
        ID:"123",
        Password:"hello"
    });
   await models.ShopInfo.create({
        ShopID:"123",
        Name:"春华路",
        Phone:"1234567",
        Address:"市中区",
        Status:1
    });
   await models.ShopInfo.create({
        ShopID:"124",
        Name:"柏杨路",
        Phone:"7654321",
        Address:"市中区",
        Status:1
    });
   await models.CustomerInfo.create({
        Name: "小红",
            Address: "市中区",
            Status: 1,
            Phone: 123987,
            Sex: "女",
            Age: 13,
            ShopInfoShopID:124
    });
}