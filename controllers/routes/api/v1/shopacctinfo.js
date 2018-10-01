'use strict';
let express = require('express');
let util = require('../../../../util/util');
let router = express.Router();
const Op = require('sequelize').Op;


router.get('/shoppoints', async (req, res) => {
    let db = res.locals.db;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    let role = await util.getRoleAsync(operateShopId);
    let queryRole = await util.getRoleAsync(queryShopId);
    logger.info(`queryShopId:${queryShopId},page:${page},role:${role},queryRole:${queryRole}`);
    let whereObj = {};
    let includeObj = {
        model: db.ShopInfo,
        require: true,
    }
    if (queryShopId != null) {
        let shopinfo = await db.ShopInfo.findOne({
            where: {
                ShopId: queryShopId
            }
        });
        if (!shopinfo) {
            res.json({
                Error: {
                    Message: `该店面不存在。ShopId:${queryShopId}`
                }
            }).end()
            return;
        }
    }
    if (role == 'superman') {
        if (queryShopId == operateShopId) {
            
        } else if (queryRole == 'admin') {
            includeObj.where = {
                ParentShopId: queryShopId,
            };
        } else if (queryShopId != null) {
            whereObj.ShopId = queryShopId;
        }
    } else if (role == 'admin') {
        if ((queryRole == 'normal' && !await util.isSubordinateAsync(operateShopId, queryShopId)) ||
            (queryRole == 'admin' && queryShopId != operateShopId) ||
            queryRole == 'superman') {
            res.json({
                Error: {
                    Message: `无权限查询该店面账户信息.ShopId:${queryShopId}`
                }
            }).end();
            return;
        }
        if (queryRole == 'admin' || queryShopId == null) {
            includeObj.where = {
                ParentShopId: operateShopId,
            };
        }
        if (queryRole == 'normal') {
            whereObj.ShopId = queryShopId;
        }
    } else {
        if (queryShopId != null && queryShopId != operateShopId) {
            res.json({
                Error: {
                    Message: `无权限查询该店面账户信息.ShopId:${queryShopId}`
                }
            }).end();
            return;
        }
        whereObj.ShopId = operateShopId;
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
                Data: data,
                Meta:{
                    Pages: pages,
                    Size: pageSize,
                    TotalRows:instance.count
                }
                
            }).end();
        } else {
            res.json({
                Data: [],
                Meta:{
                    Pages: 0,
                    Size: pageSize,
                    TotalRows:0
                }
            }).end();
        }
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
        return;
    }
});

// error 
router.use('/shoppoints', (req, res) => {
    res.json({
        Error: {
            Message: "Not Found. \nNo Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;