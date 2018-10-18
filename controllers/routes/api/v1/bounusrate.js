'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/bounusrate', async (req, res) => {
    let logger = res.locals.logger;
    logger.info(`GET bounusrate`);
    let operateShopId = res.locals.shopid;
    let db = res.locals.db;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    let role = await util.getRoleAsync(operateShopId);
    logger.info(`queryShopId:${queryShopId},page:${page},role:${role}`);
    try {
        let whereObj = {};
        let includeObj = {
            model: db.ShopInfo,
            require: true,
        }
        if (role === "normal") {
            if (queryShopId != null && operateShopId !== queryShopId) {
                throw "无权查询其它店面信息";
            }
            whereObj.ShopId = operateShopId;
        } else if (role === "admin") {
            if (queryShopId != null && !util.isSubordinateAsync(operateShopId, queryShopId)) {
                throw "无权查询其它总店下店面信息";
            }
            if (queryShopId == null) {
                includeObj.where = {
                    ParentShopId: operateShopId,
                }
            } else {
                whereObj.ShopId = queryShopId;
            }
        } else {
            if (queryShopId == null) {

            } else if (queryShopId === operateShopId) {
                whereObj.ShopId = queryShopId;
            } else if (await util.isAdminShopAsync(queryShopId)) {
                includeObj.where = {
                    [Op.or]: [{
                            ParentShopId: queryShopId
                        },
                        {
                            ShopId: queryShopId
                        }
                    ]
                };
            }
        }
        let instance = await db.BounusPointRate.findAndCountAll({
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
                Array: data,
                Meta: {
                    PageSize: pageSize,
                    TotalPages: pages,
                    CurrentRows: instance.rows.length,
                    TotalRows: instance.count,
                    CurrentPage: page
                }
            }).end();
        } else {
            res.json({
                Array: [],
                Meta: {
                    PageSize: pageSize,
                    TotalPages: 0,
                    CurrentRows: 0,
                    TotalRows: 0,
                    CurrentPage: page
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
    }
});

router.patch('/bounusrate', async (req, res) => {
    let logger = res.locals.logger;
    logger.info(`PATCH bounusrate`);
    let operateShopId = res.locals.shopid;
    let db = res.locals.db;
    let queryShopId = util.makeNumericValue(req.body.ShopId, null);
    let recommendRate = util.makeNumericValue(req.body.RecommendRate, null);
    let indirectRecommendRate = util.makeNumericValue(req.body.IndirectRecommendRate, null);
    let thirdRecommendRate = util.makeNumericValue(req.body.ThirdRecommendRate, null);
    let shopBounusRate = util.makeNumericValue(req.body.ShopBounusRate, null);
    let pointToMoneyRate = util.makeNumericValue(req.body.PointToMoneyRate, 0);
    let level = util.makeNumericValue(req.body.Level, 0);
    let page = util.makeNumericValue(req.body.Page, 1);
    let pageSize = util.makeNumericValue(req.body.Size, 20);
    let offset = (page - 1) * pageSize;
    let role = await util.getRoleAsync(operateShopId);
    logger.info(`operatedShopId:${operateShopId},queryShopId:${queryShopId},recommendRate:${recommendRate},indirectRecommendRate:${indirectRecommendRate},thirdRecommendRate:${thirdRecommendRate},shopBounusRate:${shopBounusRate},level:${level},role:${role}`);
    try {
        let whereObj = {};
        let includeObj = {
            model: db.ShopInfo,
            where: {}
        };
        if (role === "normal") {
            if (queryShopId != null && queryShopId != operateShopId) {
                throw "无权限设置其它分店的奖励比率。";
            }
            whereObj.ShopId = operateShopId;
        } else if (role === "admin") {
            if (queryShopId == null) {
                includeObj.where = {
                    ParentShopId: operateShopId
                };
            } else {
                if (!await util.isSubordinateAsync(operateShopId, queryShopId)) {
                    throw "无权限设置其它总店下分店的奖励比率。";
                } else {
                    whereObj.ShopId = queryShopId;
                }
            }
        } else {
            if (queryShopId == null) {

            } else {
                whereObj.ShopId = queryShopId;
            }
        }

        let instance = await db.BounusPointRate.findAndCountAll({
            where: whereObj,
            include: [includeObj],
            offset: offset,
            limit: pageSize
        });
        if (instance) {
            let updateObj = {}
            if (recommendRate != null) updateObj.RecommendRate = recommendRate;
            if (indirectRecommendRate != null) updateObj.IndirectRecommendRate = indirectRecommendRate;
            if (thirdRecommendRate != null) updateObj.ThirdRecommendRate = thirdRecommendRate;
            if (shopBounusRate != null) updateObj.ShopBounusRate = shopBounusRate;
            if (role == "admin" || role == "superman") {
                if (level != null) updateObj.Level = level;
                if (pointToMoneyRate != null) updateObj.PointToMoneyRate = pointToMoneyRate;
            }
            logger.info(updateObj);
            let data = [];
            for (let i of instance.rows){
                data.push(await i.update(updateObj));
            }
            let pages = Math.ceil(instance.count / pageSize);
            res.json({
                Array: data,
                Meta: {
                    PageSize: pageSize,
                    TotalPages: pages,
                    CurrentRows: instance.rows.length,
                    TotalRows: instance.count,
                    CurrentPage: page
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
    }
})

// error 
router.use('/bounusrate', (req, res) => {
    res.status(400);
    res.json({
        Error: {
            Message: "No Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;