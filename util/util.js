var util = {
    isAdminShop: function (shopID) {
        if (shopID == 11 || shopID == 12 ) 
            return true;
        return false;
    },
    isSuperman:function(shopID){
        return shopID === 1 ? true:false;
    },
    formString:function(...args){
        let string = '';
        for (let s of args){
            string += ' '+String(s); 
        }
        return string;
    }

}

module.exports = util;