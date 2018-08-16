var db = require('../models').db;

var util = {
     isAdminShopAsync: async function (shopID) {
        if (isNaN(shopID)) return false;
        var shopInfo = db.ShopInfo;
        var instance = await shopInfo.findOne({
            where: {
                ShopID: shopID
            }
        });
        if (instance) {
            if (instance.Type === 1)
                return true;
        }
        return false;
    },
    isSupermanAsync: async function (shopID) {
        if (isNaN(shopID)) return false;
        var shopInfo = db.ShopInfo;
        var instance = await shopInfo.findOne({
            where: {
                ShopID: shopID
            }
        });
        if (instance) {
            if (instance.Type === 0)
                return true;
        }
        return false;
    },
    formString: function (...args) {
        let string = '';
        for (let s of args) {
            string += ' ' + String(s);
        }
        return string;
    },
    isSubordinateAsync:async function(parentShopID,childShopID){
        if (!parentShopID || !childShopID){
            return false;
        }
        if (isNaN(parentShopID) || isNaN(childShopID)) return false;
        if (parentShopID == childShopID) return true;
        var instance = await db.ShopInfo.findOne({
            where:{
                ShopID:childShopID
            }
        });
        if (!instance) return false;
        if (instance.ParentShopID == parentShopID){
            return true;
        }
        return false;
    },
    isBelongsToByPhoneAsync:async function(customerPhone,shopID){
        if (!customerPhone || !shopID) return false;
        if (await this.isSupermanAsync(shopID)) return true;
        var instance = await db.CustomerInfo.findOne({
            where:{
                Phone:customerPhone
            }
        });
        if (!instance) return false;
        if (instance.ShopID == shopID) return true;
        if (await this.isSubordinateAsync(shopID,instance.ShopID)) return true;
        return false;
    },
    isBelongsToByIDAsync:async function(customerID,shopID){
        if (!customerID || !shopID) return false;
        if (await this.isSupermanAsync(shopID)) return true;
        var instance = await db.CustomerInfo.findOne({
            where:{
                CustomerID:customerID
            }
        });
        if (!instance) return false;
        if (instance.ShopID == shopID) return true;
        if (await this.isSubordinateAsync(shopID,instance.ShopID)) return true;
        return false;
    },
    getRoleAsync: async function (shopID){
        if (!shopID)return undefined;
        var instance = await db.ShopInfo.findOne({
            where:{
                ShopID:shopID
            }
        });
        if (!instance)return undefined;
        switch(instance.Type){
            case 0: return "superman";
            case 1: return "admin";
            default: return "normal";
        }
    },
    checkInt : function(value) {
        if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
          return Number(value);
        return NaN;
    },
    makeNumericValue:function(originValue,defaultValue){
       let temp = this.checkInt(originValue);
       if (isNaN(temp)) return defaultValue;
       return temp;
    }
}

module.exports = util;