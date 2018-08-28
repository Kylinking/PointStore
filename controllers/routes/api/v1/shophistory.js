'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/shophistory', async (req, res) => {
    let logger = res.locals.logger;
    let operateShopID = res.locals.shopid;
    let queryShopID = util.makeNumericValue(req.query.shopid,null);
    let page = util.makeNumericValue(req.query.page,1);
    let pageSize = util.makeNumericValue(req.query.size,20);
    let offset = (page - 1) * pageSize;
    let type = req.query.type || null;
    let startDate = req.query.start || null;
    let endDate = req.query.end || null;
    let db = res.locals.db;
    const duration = moment.duration(30, "days");
    logger.info(`startDate:${startDate},endDate:${endDate},queryShopID:${queryShopID}`);
    endDate = Date.parse(moment(endDate).format("MM DD YYYY"));
    startDate = Date.parse(moment(startDate).format("MM DD YYYY"));
    if (isNaN(endDate) && isNaN(startDate)) {
        endDate = Date.parse(moment().format());
        startDate = Date.parse(moment().subtract(30, 'days').format("MM DD YYYY"));
    } else if (isNaN(endDate) && !isNaN(startDate)) {
        endDate = Date.parse(moment(startDate).add(30, 'days').format("MM DD YYYY"));
    } else if (!isNaN(endDate) && isNaN(startDate)) {
        startDate = Date.parse(moment(endDate).subtract(30, 'days').format("MM DD YYYY"));
    } else {
        if (endDate < startDate) {
            [endDate, startDate] = [startDate, endDate];
        }
    }
    logger.info(`startDate:${startDate},endDate:${endDate}`);
    let whereObj = {
        Date: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
        }
    };
    let include = [];
    let role = await util.getRoleAsync(operateShopID);
    logger.info(role);
    if (role == 'normal') {
        if (queryShopID != null && queryShopID != operateShopID) {
            res.json({
                error: {
                    message: "无权查询其它店面明细"
                }
            }).end();
            return;
        }
        whereObj.ShopID = operateShopID;
    } else if (role == "admin") {
        if (queryShopID != null && !await util.isSubordinateAsync(operateShopID, queryShopID)) {
            res.json({
                error: {
                    message: "无权查询其它总店下店面明细"
                }
            }).end();
            return;
        }
        if (queryShopID == null) {
            include.push({
                model: db.ShopInfo,
                where: {
                    ParentShopID: operateShopID
                }
            })
        }
        if (queryShopID != null) {
            whereObj.ShopID = queryShopID;
        }
    } else if (role == 'superman') {
        if (await util.isAdminShopAsync(queryShopID)) {
            include.push({
                model: db.ShopInfo,
                where: {
                    ParentShopID: queryShopID
                }
            })
        } else if (queryShopID != operateShopID && queryShopID != null) {
            whereObj.ShopID = queryShopID;
        }
    }
    logger.info(whereObj);
    logger.info(include);
    let instance = await db.ShopAccountChange.findAndCountAll({
        where: whereObj,
        include: include,
        limit: pageSize,
        offset: offset
    });

    if (instance) {
        let data = [];
        instance.rows.forEach(ele => {
            ele.dataValues.Date = moment(ele.Date).format("YYYY-MM-DDTHH:mm:ss");
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
            data: []
        }).end();
    }
});

// error 
router.use('/shophistory', (req, res) => {
    res.status(400);
    res.json({
        error: {
            message: "No Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;