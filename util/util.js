var db = require('../models').db;

var util = {
     isAdminShopAsync: async function (shopId) {
        if (isNaN(shopId)) return false;
        var shopInfo = db.ShopInfo;
        var instance = await shopInfo.findOne({
            where: {
                ShopId: shopId
            }
        });
        if (instance) {
            if (instance.Type === 1)
                return true;
        }
        return false;
    },
    isSupermanAsync: async function (shopId) {
        if (isNaN(shopId)) return false;
        var shopInfo = db.ShopInfo;
        var instance = await shopInfo.findOne({
            where: {
                ShopId: shopId
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
    isSubordinateAsync:async function(parentShopId,childShopId){
        if (!parentShopId || !childShopId){
            return false;
        }
        if (isNaN(parentShopId) || isNaN(childShopId)) return false;
        if (parentShopId == childShopId) return true;
        var instance = await db.ShopInfo.findOne({
            where:{
                ShopId:childShopId
            }
        });
        if (!instance) return false;
        if (instance.ParentShopId == parentShopId){
            return true;
        }
        return false;
    },
    isBelongsToByPhoneAsync:async function(customerPhone,shopId){
        if (!customerPhone || !shopId) return false;
        if (await this.isSupermanAsync(shopId)) return true;
        var instance = await db.CustomerInfo.findOne({
            where:{
                Phone:customerPhone
            }
        });
        if (!instance) return false;
        if (instance.ShopId == shopId) return true;
        if (await this.isSubordinateAsync(shopId,instance.ShopId)) return true;
        return false;
    },
    isBelongsToByIdAsync:async function(customerId,shopId){
        if (!customerId || !shopId) return false;
        if (await this.isSupermanAsync(shopId)) return true;
        var instance = await db.CustomerInfo.findOne({
            where:{
                CustomerId:customerId
            }
        });
        if (!instance) return false;
        if (instance.ShopId == shopId) return true;
        if (await this.isSubordinateAsync(shopId,instance.ShopId)) return true;
        return false;
    },
    getRoleAsync: async function (shopId){
        if (!shopId)return undefined;
        var instance = await db.ShopInfo.findOne({
            where:{
                ShopId:shopId
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
        if (/^(\-|\+)?([0-9]+\.)?([0-9]+|Infinity)$/.test(value))
          return Number(value);
        return NaN;
    },
    checkPhone:function(value){
        if (/^[0-9]{3,4}-?[0-9]+$/.test(value))
          return value;
        return NaN;
    },
    makeNumericValue:function(originValue,defaultValue){
       let temp = this.checkInt(originValue);
       if (isNaN(temp)) return defaultValue;
       return temp;
    }
}

module.exports = util;