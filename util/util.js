var db = require('../models').db;

var util = {
     isAdminShop: async function (shopID) {
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
    isSuperman: async function (shopID) {
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
    isSubordinate:async function(parentShopID,childShopID){
        if (!parentShopID || !childShopID){
            return false;
        }
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
    isBelongsTo:async function(customerPhone,shopID){
        if (!customerPhone || !shopID) return false;
        if (await this.isSuperman(shopID)) return true;
        var instance = await db.CustomerInfo.findOne({
            where:{
                Phone:customerPhone
            }
        });
        if (!instance) return false;
        if (instance.ShopID == shopID) return true;
        if (await this.isSubordinate(shopID,instance.ShopID)) return true;
        return false;
    }
}

module.exports = util;