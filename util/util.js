var util = {
    isAdminShop: function (shopID) {
        if (shopID == 11 || shopID == 12 ) 
            return true;
        return false;
    },
    isSuperman:function(shopID){
        return shopID === 1 ? true:false;
    }

}

module.exports = util;