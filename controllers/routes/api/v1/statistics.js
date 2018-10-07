'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/statistics/shop', async (req, res) => {
    let logger = res.locals.logger;
    logger.info('statistics start');
    let operateShopId = res.locals.shopid;
    let type = req.query.Type || null;
    let startDate = req.query.Start || null;
    let endDate = req.query.End || null;
    let db = res.locals.db;
    let duration = util.makeNumericValue(req.query.Recent, 7);
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let now = Date.parse(moment().format());
    let today = Date.parse(moment().format("MM DD YYYY"));
    endDate = Date.parse(moment(endDate).format(""));
    startDate = Date.parse(moment(startDate).format(""));
    if (isNaN(endDate) && isNaN(startDate)) {
        endDate = Date.parse(moment().format());
        startDate = Date.parse(moment().subtract(duration, 'days').format(""));
    } else if (isNaN(endDate) && !isNaN(startDate)) {
        endDate = Date.parse(moment(startDate).add(duration, 'days').format(""));
    } else if (!isNaN(endDate) && isNaN(startDate)) {
        startDate = Date.parse(moment(endDate).subtract(duration, 'days').format(""));
    } else {
        if (endDate < startDate) {
            [endDate, startDate] = [startDate, endDate];
        }
    }
    logger.info(`startDate:${startDate},endDate:${endDate},queryShopId:${queryShopId},duration:${duration}`);

    let role = await util.getRoleAsync(operateShopId);
    let queryRole = await util.getRoleAsync(queryShopId);
    let newCustomers = 0;
    let totalCustomers = 0
    let accumulateCustomedPoints = 0;
    let accumulateBounusPoints = 0;
    let accumulateRecommendPoints = 0;
    let accumulateReChargedPoints = 0;
    let whereObj = {};
    let totalWhereObj = {};
    let includeObj = [];
    let durationObj = {
        [Op.between]: [
            moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
            moment(endDate).format("YYYY-MM-DD HH:mm:ss")
        ]
    };
    if (role === 'normal') {
        if (queryShopId != null && queryShopId != operateShopId) {
            res.json({
                Error: {
                    Message: '无权查询其它店面统计信息。'
                }
            }).end();
            return;
        }
        whereObj = {
            ShopId: operateShopId
        };
        totalWhereObj = whereObj;
    } else if (role === "superman") {
        if (queryShopId != null) {
            if (queryRole == "admin") {
                includeObj = [{
                    model: db.ShopInfo,
                    required: true,
                    where: {
                        ParentShopId: queryShopId
                    }
                }]
            } else if (queryRole == "normal") {
                whereObj.ShopId = queryShopId;
            }
        }
    } else { //admin
        if (queryShopId != null && queryShopId != operateShopId) {
            if (!await util.isSubordinateAsync(operateShopId, queryShopId)) {
                res.json({
                    Error: {
                        Message: '无权查询其它店面统计信息。'
                    }
                }).end();
                return;
            }
            if (queryRole == "superman") {
                res.json({
                    Error: {
                        Message: '无权查询其它店面统计信息。'
                    }
                }).end();
                return;
            }
            whereObj.ShopId = queryShopId;
        }
        if (queryShopId == operateShopId || queryShopId == null) {
            includeObj = [{
                model: db.ShopInfo,
                required: true,
                where: {
                    ShopId: operateShopId
                }
            }]
        }
    }
    totalCustomers = await db.CustomerInfo.count({
        where: whereObj,
        include: includeObj
    });
    whereObj.CreatedAt = durationObj;
    try {
        newCustomers = await db.CustomerInfo.count({
            where: whereObj,
            include: includeObj
        });
        
        accumulateCustomedPoints = await db.ShopAccountChange.sum('CustomedPoints', {
            where: whereObj,
            include: includeObj
        });
        accumulateBounusPoints = await db.ShopAccountChange.sum('ShopBounusPoints', {
            where: whereObj,
            include: includeObj
        });
        accumulateRecommendPoints = await db.ShopAccountChange.sum('RecommendPoints', {
            where: whereObj,
            include: includeObj
        });
        accumulateReChargedPoints = await db.ShopAccountChange.sum('ChargedPoints', {
            where: whereObj,
            include: includeObj
        });
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}有${totalCustomers}位客户`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}有${newCustomers}位新增客户`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateCustomedPoints}分消费积分`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateBounusPoints}分奖励积分`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateRecommendPoints}分推荐积分`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateReChargedPoints}分充值积分`);
        res.json({
            Data: {
                TotalCustomer: totalCustomers || 0,
                StartDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
                EndDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
                ShopId: queryShopId || operateShopId,                
                NewCustomer: newCustomers|| 0,
                CustomedPoints: accumulateCustomedPoints|| 0,
                ChargedPoints: accumulateReChargedPoints|| 0,
                ShopBounusPoints: accumulateBounusPoints|| 0,
                RecommendPoints: accumulateRecommendPoints|| 0
            }
        }).end();
    } catch (error) {
        logger.error(error);
        res.end();
    }
});

// error 
router.use('/customerhistory', (req, res) => {
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