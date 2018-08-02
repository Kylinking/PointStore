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
    isBelongsTo:async function(parentShopID,childShopID){
        if (!parentShopID || !childShopID){
            return false;
        }
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
    }
}

module.exports = util;