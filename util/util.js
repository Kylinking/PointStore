var util = {
    isAdminShop: function (shopID) {
        if (String(shopID).startsWith('0'))
            return true;
        return false;
    }
}

module.exports = util;