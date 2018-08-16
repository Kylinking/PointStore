'use strict';
var express = require('express');
var util = require('../../../../util/util');
var router = express.Router();
const Op = require('sequelize').Op;


router.get('/shoppoints', async (req, res) => {
    var db = res.locals.db;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    let queryShopID = util.makeNumericValue(req.query.ShopID, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    logger.info()
    let role = await util.getRoleAsync(operateShopID);
    let queryRole = await util.getRoleAsync(queryShopID);
    logger.info(`role:${role},queryRole:${queryRole}`);
    let whereObj = {};
    let includeObj = {
        model: db.ShopInfo,
        require: true,
    }
    if (queryShopID != null) {
        let shopinfo = await db.ShopInfo.findOne({
            where: {
                ShopID: queryShopID
            }
        });
        if (!shopinfo) {
            res.json({
                error: {
                    message: `该店面不存在。ShopID:${queryShopID}`
                }
            }).end()
            return;
        }
    }
    if (role == 'superman') {
        if (queryShopID == operateShopID) {

        } else if (queryRole == 'admin') {
            includeObj.where = {
                ParentShopID: queryShopID,
            };
        } else if (queryShopID != null) {
            whereObj.ShopID = queryShopID;
        }
    } else if (role == 'admin') {
        if ((queryRole == 'normal' && !await util.isSubordinateAsync(operateShopID, queryShopID)) ||
            (queryRole == 'admin' && queryShopID != operateShopID) ||
            queryRole == 'superman') {
            res.json({
                error: {
                    message: `无权限查询该店面账户信息.ShopID:${queryShopID}`
                }
            }).end();
            return;
        }
        if (queryRole == 'admin' || queryShopID == null) {
            includeObj.where = {
                ParentShopID: operateShopID,
            };
        }
        if (queryRole == 'normal') {
            whereObj.ShopID = queryShopID;
        }
    } else {
        if (queryShopID != null && queryShopID != operateShopID) {
            res.json({
                error: {
                    message: `无权限查询该店面账户信息.ShopID:${queryShopID}`
                }
            }).end();
            return;
        }
        whereObj.ShopID = operateShopID;
    }

    try {
        let instance = await db.ShopAccountInfo.findAndCountAll({
            where: whereObj,
            include: [includeObj],
            limit: pageSize,
            offset: offset
        });
        if (instance) {
            let data = [];
            instance.rows.forEach(ele => {
                data.push(ele);
            })
            let pages = Math.ceil(instance.count / pageSize);
            res.json({
                data: data,
                Pages: pages,
                Size: pageSize
            }).end();
        } else {
            res.json({
                data: [],
                Pages: 0,
                Size: pageSize
            }).end();
        }
    } catch (error) {
        logger.error(error);
        res.json({
            error: {
                message: error
            }
        }).end();
        return;
    }
});

// error 
router.use('/shoppoints', (req, res) => {
    res.status(404);
    res.json({
        error: {
            message: "Not Found. \nNo Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;