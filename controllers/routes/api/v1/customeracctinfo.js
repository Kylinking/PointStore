'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;

router.get('/userpoints', async (req, res) => {
    var logger = res.locals.logger;
    var phone = req.query.Phone || '';
    var shopID = req.query.ShopID || '';
    var page = parseInt(req.query.Page || 1);
    var pageSize = parseInt(req.query.Size || 20);
    var offset = (page - 1) * pageSize;
    var acctInfo = res.locals.db.CustomerAccountInfo;
    var operateShopID = res.locals.ShopID;
    var whereCustomerInfoObj = {};
    var whereShopInfoObj = {ParentShopID: operateShopID};
    if (phone != ''){
        whereCustomerInfoObj.Phone = phone;
    }
    if (shopID != ''){
        whereShopInfoObj.ShopID = shopID;
    }
    if (await util.isAdminShop(operateShopID)) {
        var instance = await acctInfo.findAll({
            where: {
                Include: [{
                    model: res.locals.db.CustomerInfo,
                    where: whereCustomerInfoObj,
                    Include: [{
                        model: res.locals.db.ShopInfo,
                        where: {
                            ParentShopID: operateShopID
                        }
                    }]
                }, ]
            }
        });
    }

});

module.exports = router;