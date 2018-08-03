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
    var whereShopInfoObj = {};
    if (phone != '') {
        whereCustomerInfoObj.Phone = phone;
    }
    if (await util.isSuperman(operateShopID)) {
        if (shopID != '' && shopID != operateShopID) {
            if (await util.isAdminShop(shopID)) {
                whereShopInfoObj.ParentShopID = shopID;
            } else {
                whereShopInfoObj.ShopID = shopID;
            }
        }
    } else if (await util.isAdminShop(operateShopID)) {
        whereShopInfoObj.ParentShopID = operateShopID;
        if ((shopID!='' && !await util.isSubordinate(operateShopID,shopID))
        ||(phone!= '' && !await util.isBelongsTo(phone,operateShopID))){
            res.json({
                error: {
                    message: "无权查询其它总店下用户账户"
                }
            }).end();
            return;
        }
    } else {
        if ((shopID != '' && shopID != operateShopID)
        ||(phone!= '' && !await util.isBelongsTo(phone,operateShopID))) {
            res.json({
                error: {
                    message: "无权查询其它店面用户账户"
                }
            }).end();
            return;
        } else {
            whereShopInfoObj.ShopID = operateShopID;
        }
    }
    logger.info(whereShopInfoObj);
    logger.info(whereCustomerInfoObj);
    acctInfo.findAndCountAll({
            include: [{
                model: res.locals.db.CustomerInfo,
                where: whereCustomerInfoObj,
                include: [{
                    model: res.locals.db.ShopInfo,
                    where: whereShopInfoObj
                }]
            }],
        offset: offset,
        limit: pageSize
    }).then((instance) => {
       // if (instance) {
            var pages = Math.ceil(instance.count / pageSize);
            var json = {
                data: []
            };
            instance.rows.forEach((row) => {
                json.data.push(row);
            });
            json["Pages"] = pages;
            json["Size"] = pageSize;
            res.json(json).end();
       // }
    }).catch(err => {
        res.json({
            error: {
                message: err
            }
        }).end();
    });
});

module.exports = router;