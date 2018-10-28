'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;
router.get('/statistics/shop', async (req, res) => {
    let logger = res.locals.logger;
    logger.info('statistics start');
    const dayOfmills = 24 * 60 * 60 * 1000;
    let operateShopId = res.locals.shopid;
    let type = req.query.Type || null;
    let startDate = req.query.Start || null;
    let endDate = req.query.End || null;
    let db = res.locals.db;
    let duration = util.makeNumericValue(req.query.Recent, 7);
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
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
        duration = (endDate - startDate) / dayOfmills;
    }
    logger.info(`startDate:${startDate},endDate:${endDate},queryShopId:${queryShopId},duration:${duration}`);

    let queryShop = null;
    if (queryShopId != null) {
        queryShop = await db.ShopInfo.findOne({
            where: {
                ShopId: queryShopId
            }
        });
    }
    let operateShop = await db.ShopInfo.findOne({
        where: {
            ShopId: operateShopId
        }
    });
    let newCustomers = 0;
    let nowCustomers = 0;
    let accumulateCustomedPoints = 0;
    let accumulateBounusPoints = 0;
    let accumulateRecommendPoints = 0;
    let accumulateReChargedMoney = 0;
    let accumulateCustomedMoney = 0;
    let whereObj = {};
    let customerCountObj = {};
    let includeObj = [];
    let durationObj = {
        [Op.and]: [{
                [Op.gt]: moment(startDate).format("YYYY-MM-DD 00:00:00")
            },
            {
                [Op.lt]: moment(endDate).add(1, "days").format("YYYY-MM-DD 00:00:00")
            }
        ]
    };


    let currentRows = (duration - offset);
    if ((duration - offset) > pageSize) {
        currentRows = pageSize;
    }
    if (operateShop.Type === 2) {
        if (queryShopId != null && queryShopId != operateShopId) {
            res.json({
                Error: {
                    Message: '无权查询其它店面统计信息。'
                }
            }).end();
            return;
        }
        whereObj.ShopId = operateShopId;
        customerCountObj.ShopId = operateShop.ParentShopId;
    } else if (operateShop.Type === 0) {
        if (queryShopId != null) {
            if (queryShop.Type == 1) {
                includeObj = [{
                    model: db.ShopInfo,
                    required: true,
                    attributes: [],
                    where: {
                        ParentShopId: queryShopId
                    }
                }]
            } else if (queryShop.Type == 2) {
                whereObj.ShopId = queryShopId;
            }
        }
    } else { //admin
        if (queryShopId != null && queryShopId != operateShopId) {
            if (!await util.isSubordinateAsync(operateShopId, queryShopId) || queryShop.Type == 0) {
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
                attributes: [],
                required: true,
                where: {
                    ParentShopId: operateShopId
                }
            }]
        }
        customerCountObj.ShopId = operateShopId;
    }
    nowCustomers = await db.CustomerInfo.count({
        where: customerCountObj,
        //include: includeObj
    });
    let json = {
        Array: [],
        Meta: {},
        Duration: {}
    }
    let dayCondition = {};
    let totalCustomedPoints = 0;
    let totalChargedMoney = 0;
    let totalCustomedMoney = 0;
    let totalShopBounusPoints = 0;
    let totalRecommendPoints = 0;
    let totalCustomer = 0;
    for (let i = 0; i <= currentRows; i++) {
        // dayCondition = moment(startDate).add(i+offset,"days").format("YYYY-MM-DD HH:mm:ss");
        dayCondition = {
            [Op.and]: [{
                    [Op.gt]: moment(startDate).add(i + offset, "days").format("YYYY-MM-DD 00:00:00")
                },
                {
                    [Op.lt]: moment(startDate).add(i + offset + 1, "days").format("YYYY-MM-DD 00:00:00")
                }
            ]
        }
        whereObj.CreatedAt = dayCondition;
        customerCountObj.CreatedAt = dayCondition;
        newCustomers = await db.CustomerInfo.count({
            where: customerCountObj,
            //include: includeObj
        });
        logger.info(newCustomers);
        accumulateCustomedPoints = await db.ShopAccountChange.sum('CustomedPoints', {
            where: whereObj,
            include: includeObj
        });
        logger.info(accumulateCustomedPoints);
        accumulateBounusPoints = await db.ShopAccountChange.sum('ShopBounusPoints', {
            where: whereObj,
            include: includeObj
        });
        logger.info(accumulateBounusPoints);
        accumulateRecommendPoints = await db.ShopAccountChange.sum('RecommendPoints', {
            where: whereObj,
            include: includeObj
        });
        logger.info(accumulateRecommendPoints);
        accumulateReChargedMoney = await db.ShopAccountChange.sum('ChargedMoney', {
            where: whereObj,
            include: includeObj
        });
        logger.info(accumulateReChargedMoney);
        accumulateCustomedMoney = await db.ShopAccountChange.sum('CustomedMoney', {
            where: whereObj,
            include: includeObj
        });
        logger.info(accumulateReChargedMoney);
        logger.info("==================")
        logger.info(whereObj.CreatedAt);
        let con = {
            [Op.lt]: moment(startDate).add(i + offset + 1, "days").format("YYYY-MM-DD 00:00:00")
        }
        whereObj.CreatedAt = con;
        customerCountObj.CreatedAt = con;
        logger.info("==================")
        logger.info(whereObj.CreatedAt);

        totalCustomer = await db.CustomerInfo.count({
            where: customerCountObj,
            //include: includeObj
        });
        totalCustomedPoints = await db.ShopAccountChange.sum('CustomedPoints', {
            where: whereObj,
            include: includeObj
        });
        totalShopBounusPoints = await db.ShopAccountChange.sum('ShopBounusPoints', {
            where: whereObj,
            include: includeObj
        });
        totalRecommendPoints = await db.ShopAccountChange.sum('RecommendPoints', {
            where: whereObj,
            include: includeObj
        });
        totalChargedMoney = await db.ShopAccountChange.sum('ChargedMoney', {
            where: whereObj,
            include: includeObj
        });
        totalCustomedMoney = await db.ShopAccountChange.sum('CustomedMoney', {
            where: whereObj,
            include: includeObj
        });
        json.Array.push({
            Date: moment(startDate).add(i + offset, "days").format("YYYY-MM-DDT00:00:00Z"),
            NewCustomer: newCustomers || 0,
            AccumulateCustomedPoints: accumulateCustomedPoints || 0,
            AccumulateChargedMoney: accumulateReChargedMoney || 0,
            AccumulateCustomedMoney: accumulateCustomedMoney || 0,
            AccumulateShopBounusPoints: accumulateBounusPoints || 0,
            AccumulateRecommendPoints: accumulateRecommendPoints || 0,
            TotalCustomer: totalCustomer || 0,
            TotalCustomedPoints: totalCustomedPoints || 0,
            TotalChargedMoney: totalChargedMoney || 0,
            TotalCustomedMoney: totalCustomedMoney || 0,
            TotalShopBounusPoints: totalShopBounusPoints || 0,
            TotalRecommendPoints: totalRecommendPoints || 0,
        });
        logger.info(json.Array[i]);
    }
    whereObj.CreatedAt = durationObj;
    customerCountObj.CreatedAt = durationObj;
    try {
        newCustomers = await db.CustomerInfo.count({
            where: customerCountObj,
            //include: includeObj
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
        accumulateReChargedMoney = await db.ShopAccountChange.sum('ChargedMoney', {
            where: whereObj,
            include: includeObj
        });
        accumulateCustomedMoney = await db.ShopAccountChange.sum('CustomedMoney', {
            where: whereObj,
            include: includeObj
        });
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}有${nowCustomers}位客户`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}有${newCustomers}位新增客户`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateCustomedPoints}分消费积分`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateBounusPoints}分奖励积分`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateRecommendPoints}分推荐积分`);
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}新增${accumulateReChargedMoney}分充值积分`);
        json.Duration = {
            TotalCustomer: nowCustomers || 0,
            StartDate: moment(startDate).format("YYYY-MM-DDT00:00:00Z"),
            EndDate: moment(endDate).format("YYYY-MM-DDT23:59:59Z"),
            ShopId: queryShopId || operateShopId,
            NewCustomer: newCustomers || 0,
            CustomedPoints: accumulateCustomedPoints || 0,
            CustomedMoney: accumulateCustomedMoney || 0,
            ChargedMoney: accumulateReChargedMoney || 0,
            ShopBounusPoints: accumulateBounusPoints || 0,
            RecommendPoints: accumulateRecommendPoints || 0
        };
        let pages = Math.ceil(duration / pageSize);
        json.Meta["TotalPages"] = pages;
        json.Meta["CurrentRows"] = currentRows;
        json.Meta["TotalRows"] = duration;
        json.Meta["CurrentPage"] = page;
        res.json(json).end();
    } catch (error) {
        logger.error(error);
        res.end();
    }
});

router.get('/statistics/dayend', async (req, res) => {
    let logger = res.locals.logger;
    logger.info('statistics start');
    const dayOfmills = 24 * 60 * 60 * 1000;
    let operateShopId = res.locals.shopid;
    let date = req.query.Date || null;
    let db = res.locals.db;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    let sequelize = db.sequelize;
    date = Date.parse(moment(date).format());
    if (isNaN(date)) {
        date = Date.parse(moment().format());
    }
    let todayDuration = {
        [Op.and]: [{
                [Op.gt]: moment(date).format("YYYY-MM-DD 00:00:00")
            },
            {
                [Op.lt]: moment(date).add(1, "days").format("YYYY-MM-DD 00:00:00")
            }
        ]
    };
    let monthDuration = {
        [Op.and]: [{
                [Op.gt]: moment().format("YYYY-MM-01 00:00:00")
            },
            {
                [Op.lt]: moment().format("YYYY-MM-DD 23:59:59")
            }
        ]
    };
    try {
        let whereObj = {
            CreatedAt: todayDuration
        };
        let shopWhere = {
            CreatedAt: todayDuration
        }
        let adminShopId = await util.findAdminShopId(operateShopId);
        let includeObj = {};
        let operateShop = await db.ShopInfo.findById(operateShopId);
        switch (operateShop.Type) {
            case 0:
                if (queryShopId) {
                    whereObj.ShopId = queryShopId;
                    shopWhere.ShopId = queryShopId;
                    adminShopId = await util.findAdminShopId(queryShopId);
                } else {
                    throw "需要参数：ShopId。"
                }
                break;

            case 1:
                if (queryShopId && await util.isSubordinateAsync(operateShopId, queryShopId)) {
                    whereObj.ShopId = queryShopId;
                    shopWhere.ShopId = queryShopId;
                } else if (!queryShopId) {
                    throw "需要参数：ShopId。"
                    includeObj.ParentShopId = operateShopId;
                } else {
                    throw "无权查询该店面数据";
                }
                break;
            default:
                if (queryShopId && queryShopId != operateShopId) {
                    throw "无权查询其它店面数据";
                }
                whereObj.ShopId = operateShopId;
                shopWhere.ShopId = operateShopId;

                break;
        }
        let count = await db.CustomerAccountChange.findAndCountAll({
            where: whereObj,
            attributes: [
                'CustomerId',
                [sequelize.fn('COUNT', sequelize.col('CustomerId')), 'CustomerNumber'],
            ],
            group: 'CustomerId',
            offset: offset,
            limit: pageSize
        });
        logger.info(count);
        let json = {
            Array: []
        };
        let instances = await db.CustomerAccountChange.findAndCountAll({
            // attributes:{
            //     include:[
            //     [sequelize.fn('SUM',sequelize.col('ChargedMoney')),'RechargedMoney'],
            //     [sequelize.fn('SUM',sequelize.col('CustomedMoney')),'CustomedMoney'],
            //     [sequelize.fn('SUM',sequelize.col('CustomedPoints')),'CustomedPoints'],
            //     [sequelize.fn('SUM',sequelize.col('CustomedPoints')),'CustomedPoints'],
            //     [sequelize.fn('SUM',sequelize.col('ShopBounusPoints')),'ShopBounusPoints'],
            //     [sequelize.fn('SUM',sequelize.col('RecommendPoints')),'RecommendPoints'],
            //     [sequelize.fn('SUM',sequelize.col('IndirectRecommendPoints')),'IndirectRecommendPoints'],
            //     [sequelize.fn('SUM',sequelize.col('ThirdRecommendPoints')),'ThirdRecommendPoints'],
            // ]
            // },
            where: whereObj,
            //include:[includeObj],
            // group:'CustomerId',
            order: [
                [sequelize.col('Id'), 'DESC']
            ],
        });
        for (let index of count.rows) {
            whereObj.CustomerId = index.CustomerId;
            logger.info(instances);
            logger.info(instances.rows);
            let records = [];
            let customer = await instances.rows[0].getCustomerInfo();
            records = instances.rows;
            let t = {};
            t = customer.toJSON();
            t.Records = records;
            json.Array.push(t);
        }

        let statShopAccountInfoOfToday = (await db.ShopAccountChange.findOne({
                attributes:[
                //    'CustomerId',
                [sequelize.fn('SUM',sequelize.col('ChargedMoney')),'RechargedMoney'],
                [sequelize.fn('SUM',sequelize.col('CustomedMoney')),'CustomedMoney'],
                [sequelize.fn('SUM',sequelize.col('CustomedPoints')),'CustomedPoints'],
                [sequelize.fn('SUM',sequelize.col('ShopBounusPoints')),'ShopBounusPoints'],
                [sequelize.fn('SUM',sequelize.col('RecommendPoints')),'RecommendPoints'],
            ],
            where: shopWhere,
        })).toJSON();
        let statCustomerInfoOfToday = await db.CustomerInfo.count({
            where:{
                CreatedAt:todayDuration,
                ShopId:adminShopId
            }
        });
        statShopAccountInfoOfToday.NewCustomer = statCustomerInfoOfToday;
        shopWhere.CreatedAt = monthDuration;
        let statShopAccountInfoOfMonth = (await db.ShopAccountChange.findOne({
            attributes:[
            //    'CustomerId',
            [sequelize.fn('SUM',sequelize.col('ChargedMoney')),'RechargedMoney'],
            [sequelize.fn('SUM',sequelize.col('CustomedMoney')),'CustomedMoney'],
            [sequelize.fn('SUM',sequelize.col('CustomedPoints')),'CustomedPoints'],
            [sequelize.fn('SUM',sequelize.col('ShopBounusPoints')),'ShopBounusPoints'],
            [sequelize.fn('SUM',sequelize.col('RecommendPoints')),'RecommendPoints'],
        ],
        where: shopWhere,
    })).toJSON();
    let statCustomerInfoOfMonth = await db.CustomerInfo.count({
        where:{
            CreatedAt:monthDuration,
            ShopId:adminShopId
        }
    });
    statShopAccountInfoOfMonth.NewCustomer= statCustomerInfoOfMonth;

        logger.info(statShopAccountInfoOfToday);
        logger.info(statCustomerInfoOfToday);
        logger.info(statShopAccountInfoOfMonth);
        logger.info(statCustomerInfoOfMonth);
        json.Meta = {
            "TotalPages": Math.ceil(count.count.length / pageSize),
            "CurrentRows": count.rows.length,
            "TotalRows": count.count.length,
            "CurrentPage": page,
            "TodayStatistic":statShopAccountInfoOfToday,
            "MonthStatistic":statShopAccountInfoOfMonth
        }
        res.json(json).end();
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }

});





// error 
router.use('/statistics', (req, res) => {
    res.json({
        Error: {
            Message: "无此服务： " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;